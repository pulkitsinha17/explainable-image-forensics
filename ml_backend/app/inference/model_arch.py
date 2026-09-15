"""
PIXENTRA — model architecture definitions.

Architecture extracted verbatim from the authoritative Kaggle notebook:
  MPC_MultiEvidence_Corrected_STRONG_FINAL.ipynb

Two model classes are defined:

1. MPCModel  — the released MPC backbone (HRFormer encoder + decoder)
               loaded from MPC_CASIAv2_stage2_weights.pth.
               Used as a frozen evidence prior.

2. StrongMultiEvidenceNet — the trained PIXENTRA model that accepts
               (rgb, evidence_tensor) and produces a forgery logit map.
               Loaded from best_multi_evidence_stage1.pth.

DO NOT modify these classes — they must match the checkpoint weights exactly.
"""
import sys
from pathlib import Path
import torch
import torch.nn as nn
import torch.nn.functional as F

# ── Make the MPC source code importable ───────────────────────────────────────
# The MPC HRFormer backbone lives in ml_backend/HRFormer/ (copied from MPC-main)
_ML_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(_ML_BACKEND_ROOT))   # so "from HRFormer..." works


def _import_mpc_model():
    """
    Import the MPC backbone MyModel.
    The HRFormer source must be present in ml_backend/HRFormer/.
    Returns the MyModel class, or raises ImportError with a clear message.
    """
    try:
        from HRFormer.hrt_backbone import get_hrformer  # type: ignore

        class MyModel(nn.Module):
            """Exact MPC architecture used by the released checkpoint."""
            def __init__(self):
                super().__init__()
                self.encoder = get_hrformer()
                # Decoder is imported from the copied MPC source tree
                from decoder_head import Decoder  # type: ignore
                self.decoder = Decoder()

            def forward(self, inputs):
                x = self.encoder(inputs)
                return self.decoder(x)

        return MyModel
    except ImportError as exc:
        raise ImportError(
            f"Cannot import MPC backbone: {exc}.\n"
            "Expected HRFormer/ and decoder_head.py to be present in ml_backend/.\n"
            "These files are copied from the MPC-main repository.\n"
            "Check that the copy step ran correctly and the files are present."
        ) from exc


# ─────────────────────────────────────────────────────────────────────────────
#  StrongMultiEvidenceNet — verbatim from notebook cell 13
# ─────────────────────────────────────────────────────────────────────────────

try:
    from torchvision.models import resnet34, ResNet34_Weights
except ImportError as e:
    raise ImportError("torchvision is required. Install with: pip install torchvision") from e


class ConvBNAct(nn.Module):
    def __init__(self, cin, cout, k=3, p=1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(cin, cout, k, p, bias=False),
            nn.BatchNorm2d(cout),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.net(x)


class EvidenceEncoder(nn.Module):
    """
    Encodes the 5-channel evidence tensor [MPC_prior, noise, freq/DCT, ELA, local_stats]
    into multi-scale feature maps that are fused with the RGB ResNet34 backbone.
    """
    def __init__(self):
        super().__init__()
        self.e1 = nn.Sequential(ConvBNAct(5, 32), ConvBNAct(32, 32))
        self.e2 = nn.Sequential(nn.MaxPool2d(2), ConvBNAct(32, 64), ConvBNAct(64, 64))
        self.e3 = nn.Sequential(nn.MaxPool2d(2), ConvBNAct(64, 128), ConvBNAct(128, 128))
        self.e4 = nn.Sequential(nn.MaxPool2d(2), ConvBNAct(128, 256), ConvBNAct(256, 256))

    def forward(self, x):
        a = self.e1(x)
        b = self.e2(a)
        c = self.e3(b)
        d = self.e4(c)
        return a, b, c, d


class FPNBlock(nn.Module):
    def __init__(self, cin, cout):
        super().__init__()
        self.lat = nn.Conv2d(cin, cout, 1)
        self.ref = nn.Sequential(ConvBNAct(cout, cout), ConvBNAct(cout, cout))

    def forward(self, x):
        return self.ref(self.lat(x))


class StrongMultiEvidenceNet(nn.Module):
    """
    PIXENTRA proposed model: ResNet34 multi-scale FPN + 5-channel evidence + residual MPC prior.

    Inputs:
        rgb      : (B, 3, H, W)   float32, values in [0, 1]
        evidence : (B, 5, H, W)   float32, channels:
                       0 = MPC probability map (from frozen MPC backbone)
                       1 = noise residual map
                       2 = frequency/DCT map
                       3 = ELA map
                       4 = local statistics map

    Output:
        logits   : (B, 1, H, W)   raw logits (apply sigmoid for probability)
    """
    def __init__(self):
        super().__init__()
        r = resnet34(weights=ResNet34_Weights.DEFAULT)
        self.stem = nn.Sequential(r.conv1, r.bn1, r.relu)
        self.pool = r.maxpool
        self.l1 = r.layer1
        self.l2 = r.layer2
        self.l3 = r.layer3
        self.l4 = r.layer4

        self.evidence = EvidenceEncoder()

        # FPN fusion: RGB channels 64, 64, 128, 256, 512  |  Evidence: 32, 64, 128, 256
        self.f4 = FPNBlock(512 + 256, 256)
        self.f3 = FPNBlock(256 + 128, 192)
        self.f2 = FPNBlock(128 + 64, 128)
        self.f1 = FPNBlock(64 + 32, 96)

        self.fuse4 = ConvBNAct(256, 256)
        self.fuse3 = ConvBNAct(192, 192)
        self.fuse2 = ConvBNAct(128, 128)
        self.fuse1 = ConvBNAct(96, 96)

        self.gate = nn.Sequential(
            nn.Conv2d(256 + 192 + 128 + 96, 128, 1),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 4, 1),
        )
        self.head = nn.Sequential(
            ConvBNAct(256 + 192 + 128 + 96, 128),
            ConvBNAct(128, 64),
            nn.Conv2d(64, 1, 1),
        )

        # Residual branch — initialised to preserve MPC prior at startup
        self.residual_scale = nn.Parameter(torch.tensor(0.35))
        self.prior_scale = nn.Parameter(torch.tensor(2.0))

    def forward(self, rgb, evidence, return_aux=False):
        # RGB backbone
        x = self.stem(rgb)
        x = self.pool(x)
        r1 = self.l1(x)
        r2 = self.l2(r1)
        r3 = self.l3(r2)
        r4 = self.l4(r3)

        # Evidence encoder
        e1, e2, e3, e4 = self.evidence(evidence)

        # FPN fusion
        q4 = self.f4(torch.cat([r4, e4], 1))
        q3 = self.f3(torch.cat([r3, e3], 1))
        q2 = self.f2(torch.cat([r2, e2], 1))
        q1 = self.f1(torch.cat([r1, e1], 1))

        q4 = self.fuse4(q4)
        q3 = self.fuse3(q3)
        q2 = self.fuse2(q2)
        q1 = self.fuse1(q1)

        target = q1.shape[-2:]
        u4 = F.interpolate(q4, size=target, mode="bilinear", align_corners=False)
        u3 = F.interpolate(q3, size=target, mode="bilinear", align_corners=False)
        u2 = F.interpolate(q2, size=target, mode="bilinear", align_corners=False)

        multi = torch.cat([q1, u2, u3, u4], 1)
        g = torch.softmax(self.gate(multi), dim=1)
        weighted = torch.cat(
            [q1 * g[:, 0:1], u2 * g[:, 1:2], u3 * g[:, 2:3], u4 * g[:, 3:4]], 1
        )

        residual = self.head(weighted)
        prior = evidence[:, 0:1]  # MPC probability map

        out = F.interpolate(
            self.prior_scale * torch.logit(prior.clamp(1e-4, 1 - 1e-4))
            + self.residual_scale * residual,
            size=rgb.shape[-2:],
            mode="bilinear",
            align_corners=False,
        )

        if return_aux:
            return out, (q2, q3, q4, g)
        return out
