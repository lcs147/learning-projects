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

def mse(params, predict, x_dense, x_cat, target):
    pred = predict(params, x_dense, x_cat)
    return np.mean((target - pred) ** 2)

def logloss(params, predict, x_dense, x_cat, target):
    pred = sigmoid(predict(params, x_dense, x_cat))
    pred = np.clip(pred, 1e-9, 1 - 1e-9)

    return -np.mean(target * np.log(pred) + (1 - target) * np.log(1 - pred))

from sklearn.metrics import roc_auc_score
def aucscore(params, predict, x_dense, x_cat, target):
    pred = sigmoid(predict(params, x_dense, x_cat))
    return roc_auc_score(target.flatten(), pred.flatten())