"""
PIXENTRA — model architecture definitions.

Authoritative architecture reconstructed verbatim from the training notebook
`final_completed_major_project(1)`.

Hierarchy:
StrongMultiEvidenceNet (MultiEvidenceModel)
  ├── mpc_rgb: MPCPlusRGBFeatureExtractor
  │     └── mpc_rgb_model: MultiScaleRGBMPC
  │           ├── rgb_encoder: RGBEncoder (ResNet34 stem + layer1..4)
  │           ├── mpc: MyModel (CATNet / HRFormer backbone)
  │           ├── fuse128, fuse64, fuse32, fuse16: MPCGuidedFusion
  │           ├── dec32, dec64, dec128, dec256: DecoderBlock
  │           └── final: nn.Sequential(ConvBlock, nn.Conv2d)
  ├── compression_encoder: CompressionEvidenceEncoder (1 -> 32)
  ├── freqnoise_encoder: FrequencyNoiseEvidenceEncoder (2 -> 32)
  ├── statistical_encoder: StatisticalEvidenceEncoder (2 -> 32)
  ├── ela_encoder: ELAEncoder (1 -> 32)
  ├── metadata_encoder: MetadataEncoder (10+1 -> 32 -> film 128*2)
  ├── fusion: EvidenceFusion (64 + 1 + 32*4 -> 128)
  ├── localization_head: LocalizationHead (128 -> 64 -> 32 -> 1)
  └── risk_head: RiskAssessmentHead (128 + 2 -> 64 -> 1)
"""
from __future__ import annotations
import sys
from pathlib import Path
from typing import Optional, Dict, Any, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet34, ResNet34_Weights

# ── Make the MPC source code importable ───────────────────────────────────────
_ML_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ML_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_ML_BACKEND_ROOT))

# Import MPC MyModel (CATNet stage2 model)
try:
    from model import MyModel
except ImportError:
    from HRFormer.hrt_backbone import get_hrformer  # type: ignore
    from decoder_head import Decoder  # type: ignore

    class MyModel(nn.Module):  # type: ignore
        def __init__(self):
            super().__init__()
            self.encoder = get_hrformer()
            self.decoder = Decoder()

        def forward(self, inputs):
            x = self.encoder(inputs)
            return self.decoder(x)

MPCModel = MyModel


def _import_mpc_model():
    """
    Import or return the MPC backbone MyModel class.
    Used by model_loader._load_mpc().
    """
    return MyModel


IMG_SIZE = 512
METADATA_DIM = 10
FUSED_CH = 128
EVIDENCE_CH = 32

IMAGENET_MEAN = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
IMAGENET_STD = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)


# ================================================================
# RESNET34 ENCODER
# ================================================================

class RGBEncoder(nn.Module):
    def __init__(self):
        super().__init__()
        backbone = resnet34(weights=None)
        self.stem = nn.Sequential(
            backbone.conv1,
            backbone.bn1,
            backbone.relu,
        )
        self.pool = backbone.maxpool
        self.layer1 = backbone.layer1
        self.layer2 = backbone.layer2
        self.layer3 = backbone.layer3
        self.layer4 = backbone.layer4

    def forward(self, x):
        # 512 -> 256
        x0 = self.stem(x)
        # 256 -> 128
        x1 = self.layer1(self.pool(x0))
        # 128 -> 64
        x2 = self.layer2(x1)
        # 64 -> 32
        x3 = self.layer3(x2)
        # 32 -> 16
        x4 = self.layer4(x3)
        return x0, x1, x2, x3, x4


# ================================================================
# CONV BLOCK
# ================================================================

class ConvBlock(nn.Module):
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


# ================================================================
# MPC GUIDED FUSION
# ================================================================

class MPCGuidedFusion(nn.Module):
    def __init__(self, rgb_channels: int, out_channels: int):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(rgb_channels + 1, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )
        self.gate = nn.Sequential(
            nn.Conv2d(rgb_channels + 1, out_channels, 1),
            nn.Sigmoid(),
        )

    def forward(self, rgb, mpc):
        mpc = F.interpolate(
            mpc,
            size=rgb.shape[-2:],
            mode="bilinear",
            align_corners=False,
        )
        combined = torch.cat([rgb, mpc], dim=1)
        features = self.conv(combined)
        gate = self.gate(combined)
        return features * gate + features


# ================================================================
# DECODER BLOCK
# ================================================================

class DecoderBlock(nn.Module):
    def __init__(self, in_channels: int, skip_channels: int, out_channels: int):
        super().__init__()
        self.conv = ConvBlock(in_channels + skip_channels, out_channels)

    def forward(self, x, skip):
        x = F.interpolate(
            x,
            size=skip.shape[-2:],
            mode="bilinear",
            align_corners=False,
        )
        x = torch.cat([x, skip], dim=1)
        return self.conv(x)


# ================================================================
# MULTI-SCALE RGB + MPC
# ================================================================

class MultiScaleRGBMPC(nn.Module):
    def __init__(self, mpc_model: Optional[nn.Module] = None):
        super().__init__()
        self.rgb_encoder = RGBEncoder()
        self.mpc = mpc_model if mpc_model is not None else MyModel()
        self.fuse128 = MPCGuidedFusion(64, 64)
        self.fuse64 = MPCGuidedFusion(128, 128)
        self.fuse32 = MPCGuidedFusion(256, 256)
        self.fuse16 = MPCGuidedFusion(512, 512)

        self.dec32 = DecoderBlock(512, 256, 256)
        self.dec64 = DecoderBlock(256, 128, 128)
        self.dec128 = DecoderBlock(128, 64, 64)
        self.dec256 = DecoderBlock(64, 64, 32)

        self.final = nn.Sequential(
            ConvBlock(32, 32),
            nn.Conv2d(32, 1, 1),
        )

    def forward(self, image):
        mean = IMAGENET_MEAN.to(image.device)
        std = IMAGENET_STD.to(image.device)
        rgb = (image - mean) / std

        x0, x1, x2, x3, x4 = self.rgb_encoder(rgb)

        with torch.no_grad():
            mpc_logits = self.mpc(image)
            mpc = torch.sigmoid(mpc_logits)

        f128 = self.fuse128(x1, mpc)
        f64 = self.fuse64(x2, mpc)
        f32 = self.fuse32(x3, mpc)
        f16 = self.fuse16(x4, mpc)

        x = self.dec32(f16, f32)
        x = self.dec64(x, f64)
        x = self.dec128(x, f128)
        x = self.dec256(x, x0)

        x = F.interpolate(
            x,
            size=(IMG_SIZE, IMG_SIZE),
            mode="bilinear",
            align_corners=False,
        )
        return self.final(x)


# ================================================================
# MPC+RGB FEATURE EXTRACTOR
# ================================================================

class MPCPlusRGBFeatureExtractor(nn.Module):
    def __init__(self, mpc_rgb_model: nn.Module):
        super().__init__()
        self.mpc_rgb_model = mpc_rgb_model
        self._features: Dict[str, torch.Tensor] = {}
        self.mpc_rgb_model.dec128.register_forward_hook(self._hook_deep)
        self.mpc_rgb_model.mpc.register_forward_hook(self._hook_mpc)

    def _hook_deep(self, module, inp, out):
        self._features["deep128"] = out

    def _hook_mpc(self, module, inp, out):
        self._features["mpc_logits"] = out

    def forward(self, image):
        final_logits = self.mpc_rgb_model(image)
        deep_features = self._features.get("deep128", None)
        mpc_prob = torch.sigmoid(self._features.get("mpc_logits", final_logits))
        return {
            "final_logits": final_logits,
            "final_prob": torch.sigmoid(final_logits),
            "deep_features": deep_features,
            "mpc_prob": mpc_prob,
        }


# ================================================================
# EVIDENCE ENCODERS
# ================================================================

class SpatialEvidenceEncoder(nn.Module):
    def __init__(self, in_channels: int, out_channels: int = 32):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.net(x)


class CompressionEvidenceEncoder(SpatialEvidenceEncoder):
    def __init__(self, out_channels: int = 32):
        super().__init__(in_channels=1, out_channels=out_channels)


class FrequencyNoiseEvidenceEncoder(SpatialEvidenceEncoder):
    def __init__(self, out_channels: int = 32):
        super().__init__(in_channels=2, out_channels=out_channels)


class StatisticalEvidenceEncoder(SpatialEvidenceEncoder):
    def __init__(self, out_channels: int = 32):
        super().__init__(in_channels=2, out_channels=out_channels)


class ELAEncoder(SpatialEvidenceEncoder):
    def __init__(self, out_channels: int = 32):
        super().__init__(in_channels=1, out_channels=out_channels)


class MetadataEncoder(nn.Module):
    def __init__(self, in_dim: int = METADATA_DIM, embed_dim: int = 32, film_channels: int = 128):
        super().__init__()
        self.embed = nn.Sequential(
            nn.Linear(in_dim + 1, embed_dim),
            nn.ReLU(inplace=True),
            nn.Linear(embed_dim, embed_dim),
            nn.ReLU(inplace=True),
        )
        self.film = nn.Linear(embed_dim, film_channels * 2)
        self.film_channels = film_channels

    def forward(self, meta_vec, meta_avail):
        x = torch.cat([meta_vec, meta_avail.unsqueeze(1)], dim=1)
        embedding = self.embed(x)
        gamma_beta = self.film(embedding)
        gamma, beta = gamma_beta.chunk(2, dim=1)
        gamma = gamma.unsqueeze(-1).unsqueeze(-1)
        beta = beta.unsqueeze(-1).unsqueeze(-1)
        return embedding, gamma, beta


# ================================================================
# ATTENTION & FUSION
# ================================================================

class ChannelAttention(nn.Module):
    def __init__(self, channels: int, reduction: int = 8):
        super().__init__()
        hidden = max(channels // reduction, 8)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(channels, hidden),
            nn.ReLU(inplace=True),
            nn.Linear(hidden, channels),
            nn.Sigmoid(),
        )

    def forward(self, x):
        b, c, _, _ = x.shape
        w = self.pool(x).view(b, c)
        w = self.fc(w).view(b, c, 1, 1)
        return x * w, w.view(b, c)


class EvidenceFusion(nn.Module):
    def __init__(self, deep_ch: int = 64, mpc_ch: int = 1, evidence_ch: int = 32, fused_ch: int = 128):
        super().__init__()
        in_ch = deep_ch + mpc_ch + evidence_ch * 4
        self.attn = ChannelAttention(in_ch)
        self.reduce = nn.Sequential(
            nn.Conv2d(in_ch, fused_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(fused_ch),
            nn.ReLU(inplace=True),
        )
        self.refine = nn.Sequential(
            nn.Conv2d(fused_ch, fused_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(fused_ch),
            nn.ReLU(inplace=True),
        )
        base = deep_ch + mpc_ch
        self.branch_slices = {
            "deep_learning_mpc": slice(0, base),
            "compression": slice(base, base + evidence_ch),
            "frequency_noise": slice(base + evidence_ch, base + 2 * evidence_ch),
            "statistical": slice(base + 2 * evidence_ch, base + 3 * evidence_ch),
            "ela": slice(base + 3 * evidence_ch, base + 4 * evidence_ch),
        }
        self.fused_ch = fused_ch

    def forward(self, deep_features, mpc_prob, comp_feat, freq_feat, stat_feat, ela_feat, gamma, beta):
        concat = torch.cat(
            [deep_features, mpc_prob, comp_feat, freq_feat, stat_feat, ela_feat],
            dim=1,
        )
        gated, channel_weights = self.attn(concat)
        fused = self.reduce(gated)
        fused = self.refine(fused)
        fused = fused * (1 + torch.tanh(gamma)) + beta
        branch_contribution = {
            name: channel_weights[:, sl].mean(dim=1)
            for name, sl in self.branch_slices.items()
        }
        return fused, branch_contribution


# ================================================================
# HEADS
# ================================================================

class ConvBlockNew(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class LocalizationHead(nn.Module):
    def __init__(self, in_channels: int = 128, img_size: int = IMG_SIZE):
        super().__init__()
        self.img_size = img_size
        self.block1 = ConvBlockNew(in_channels, 64)
        self.block2 = ConvBlockNew(64, 32)
        self.out_conv = nn.Conv2d(32, 1, 1)

    def forward(self, fused):
        x = self.block1(fused)
        x = F.interpolate(x, scale_factor=2, mode="bilinear", align_corners=False)
        x = self.block2(x)
        x = F.interpolate(x, size=(self.img_size, self.img_size), mode="bilinear", align_corners=False)
        return self.out_conv(x)


class RiskAssessmentHead(nn.Module):
    def __init__(self, in_channels: int = 128, hidden: int = 64):
        super().__init__()
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.mlp = nn.Sequential(
            nn.Linear(in_channels + 2, hidden),
            nn.ReLU(inplace=True),
            nn.Linear(hidden, 1),
        )

    def forward(self, fused, pred_prob):
        pooled = self.pool(fused).flatten(1)
        mean_prob = pred_prob.mean(dim=(1, 2, 3)).unsqueeze(1)
        area_frac = (pred_prob > 0.5).float().mean(dim=(1, 2, 3)).unsqueeze(1)
        x = torch.cat([pooled, mean_prob, area_frac], dim=1)
        return torch.sigmoid(self.mlp(x)).squeeze(1)


# ================================================================
# MULTI-EVIDENCE MODEL (STRONG PROPOSED MODEL)
# ================================================================

class MultiEvidenceModel(nn.Module):
    def __init__(
        self,
        mpc_rgb_model: Optional[nn.Module] = None,
        metadata_dim: int = METADATA_DIM,
        fused_ch: int = FUSED_CH,
        evidence_ch: int = EVIDENCE_CH,
    ):
        super().__init__()
        if mpc_rgb_model is None:
            mpc_rgb_model = MultiScaleRGBMPC()
        self.mpc_rgb = MPCPlusRGBFeatureExtractor(mpc_rgb_model)
        self.compression_encoder = CompressionEvidenceEncoder(out_channels=evidence_ch)
        self.freqnoise_encoder = FrequencyNoiseEvidenceEncoder(out_channels=evidence_ch)
        self.statistical_encoder = StatisticalEvidenceEncoder(out_channels=evidence_ch)
        self.ela_encoder = ELAEncoder(out_channels=evidence_ch)
        self.metadata_encoder = MetadataEncoder(in_dim=metadata_dim, embed_dim=32, film_channels=fused_ch)
        self.fusion = EvidenceFusion(deep_ch=64, mpc_ch=1, evidence_ch=evidence_ch, fused_ch=fused_ch)
        self.localization_head = LocalizationHead(in_channels=fused_ch, img_size=IMG_SIZE)
        self.risk_head = RiskAssessmentHead(in_channels=fused_ch, hidden=64)

    def forward(
        self,
        image: torch.Tensor,
        comp_map: Optional[torch.Tensor] = None,
        freq_map: Optional[torch.Tensor] = None,
        stat_map: Optional[torch.Tensor] = None,
        ela_map: Optional[torch.Tensor] = None,
        meta_vec: Optional[torch.Tensor] = None,
        meta_avail: Optional[torch.Tensor] = None,
    ) -> Dict[str, Any]:
        batch_size = image.shape[0]
        device = image.device

        # Fallbacks for optional inputs if passed during single-tensor inference
        if comp_map is None:
            comp_map = torch.zeros((batch_size, 1, 128, 128), device=device)
        if freq_map is None:
            freq_map = torch.zeros((batch_size, 2, 128, 128), device=device)
        if stat_map is None:
            stat_map = torch.zeros((batch_size, 2, 128, 128), device=device)
        if ela_map is None:
            ela_map = torch.zeros((batch_size, 1, 128, 128), device=device)
        if meta_vec is None:
            meta_vec = torch.zeros((batch_size, METADATA_DIM), device=device)
        if meta_avail is None:
            meta_avail = torch.zeros((batch_size,), device=device)

        with torch.no_grad():
            backbone_out = self.mpc_rgb(image)

        deep_features = backbone_out["deep_features"]
        mpc_prob = backbone_out["mpc_prob"]

        comp_feat = self.compression_encoder(comp_map)
        freq_feat = self.freqnoise_encoder(freq_map)
        stat_feat = self.statistical_encoder(stat_map)
        ela_feat = self.ela_encoder(ela_map)

        metadata_embedding, gamma, beta = self.metadata_encoder(meta_vec, meta_avail)

        fused, branch_contribution = self.fusion(
            deep_features, mpc_prob, comp_feat, freq_feat, stat_feat, ela_feat, gamma, beta
        )

        localization_logits = self.localization_head(fused)
        localization_prob = torch.sigmoid(localization_logits)

        with torch.no_grad():
            risk_score = self.risk_head(fused, localization_prob)

        return {
            "logits": localization_logits,
            "prob": localization_prob,
            "fused_features": fused,
            "deep_features": deep_features,
            "mpc_prob": mpc_prob,
            "comp_feat": comp_feat,
            "freq_feat": freq_feat,
            "stat_feat": stat_feat,
            "ela_feat": ela_feat,
            "metadata_embedding": metadata_embedding,
            "branch_contribution": branch_contribution,
            "risk_score": risk_score,
        }


# Alias for compatibility
StrongMultiEvidenceNet = MultiEvidenceModel
