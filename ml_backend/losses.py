import torch
import torch.nn.functional as F


def Sigmoid_Focal_Loss(pred, target, alpha=0.5, gamma=2):
    """
    pred : [B, 1, H, W]
    target : [B, 1, H, W]
    """
    if pred.shape[2:] != target.shape[2:]:
        target = F.interpolate(target, size=pred.shape[2:], mode='nearest')
    target = target.squeeze(1)

    p = torch.sigmoid(pred.squeeze(1))
    ce_loss = F.binary_cross_entropy_with_logits(pred.squeeze(1), target, reduction="none")

    p_t = p * target + (1 - p) * (1 - target)

    loss = ce_loss * ((1 - p_t) ** gamma)

    if alpha >= 0:
        alpha_t = alpha * target + (1 - alpha) * (1 - target)
        loss = alpha_t * loss

    loss = loss.mean()

    return loss
