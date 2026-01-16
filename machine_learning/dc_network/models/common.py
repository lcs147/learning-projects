import autograd.numpy as np

# ==========================
# Helper

def create_mat(shape): # He Normal
    return np.random.randn(*shape) * np.sqrt(2.0 / shape[-2])


# ===========================
# Activations

def relu(val):
    return np.maximum(0, val)
def sigmoid(val):
    return (1.0 / (1 + np.exp(-val)))
def hard_tanh(val):
    return np.clip(val, -1.0, 1.0)

def softmax(v, axis = -1):
    v = np.exp(v - np.max(v, axis = axis, keepdims=True))
    return v / np.sum(v, axis = axis, keepdims=True)

# ==========================
# Losses + Scores

def mse(flat_params, params, predict, x_dense, x_cat, target):
    pred = predict(params, x_dense, x_cat)

    loss = np.mean((target - pred) ** 2)
    l2 = 3e-5 * np.sum(flat_params ** 2)
    
    return loss + l2

def logloss(flat_params, params, predict, x_dense, x_cat, target):
    pred = sigmoid(predict(params, x_dense, x_cat))
    pred = np.clip(pred, 1e-9, 1 - 1e-9)

    loss = -np.mean(target * np.log(pred) + (1.0 - target) * np.log(1.0 - pred))
    l2 = 3e-5 * np.sum(flat_params ** 2)

    return loss + l2

from sklearn.metrics import roc_curve, auc
def all_scores(pred, target):
    fpr, tpr, thresholds = roc_curve(target, pred)
    
    auc_val = auc(fpr, tpr)
    gini = 2.0 * auc_val - 1.0

    ks = np.max(tpr - fpr)
    ks_threshold = thresholds[np.argmax(tpr - fpr)]

    return {'auc':auc_val, 'gini':gini, 'ks':ks, 'ks_threshold':ks_threshold}