from .common import np, create_mat, hard_tanh, softmax, relu

def create_cross_net(d, r, n_experts):
    G = create_mat((d, n_experts))

    V = create_mat((n_experts, d, r))
    C = create_mat((n_experts, r, r))
    U = create_mat((n_experts, r, d))
    # V @ C @ U = W
    # dr + rr + rd = r^2 + 2rd <= d^2
    # -d^2 + 2rd + r^2 <= 0
    # r < 0.412 d

    bias = np.zeros((1, d))

    return [G, U, C, V, bias]

r_frac = 0.412 / 2.0

def init_params(n_dense_features, d_embeddings = [], l_cn = 2, d_ff = -1 , l_ff = 2, n_experts = 4, r = -1):
    # ======================
    # Get Input Size
    tot_emb_sz = sum(emb_sz for _, emb_sz in d_embeddings)
    d_cn = n_dense_features + tot_emb_sz

    # ======================
    # Set Free Variables

    if d_ff == -1: d_ff = 4 * d_cn
    if r == -1: r = min(max(np.floor(r_frac * d_cn).astype(int), 1), 258)

    # =======================
    # Layers

    emb_layers = [create_mat((vocab_size, emb_sz)) for vocab_size, emb_sz in d_embeddings]

    cn_layers = [create_cross_net(d_cn, r, n_experts) for _ in range(l_cn)]

    last_d = d_cn

    ff_layers = []
    if l_ff >= 1:
        ff_layers = [[create_mat((d_cn, d_ff)), np.zeros((1, d_ff))]]
        ff_layers += [[create_mat((d_ff, d_ff)), np.zeros((1, d_ff))] for _ in range(l_ff - 1)]
        last_d = d_ff

    W_output = create_mat((last_d, 1))

    return {'emb': emb_layers, 'cn': cn_layers, 'ff': ff_layers, 'W_out': W_output}

def predict(params, x_dense, x_cat):

    embs = [emb[idx] for emb, idx in zip(params['emb'], x_cat)]

    x0 = np.hstack([x_dense.T] + embs)
    x = x0
    # (batch, d_cn)
    
    act = hard_tanh
    for G, U, C, V, bias in params['cn']:

        importance = softmax(x @ G) # (batch, n_experts)
        importance = np.expand_dims(importance, axis = -1) # (batch, n_experts, 1)

        # (batch, d_cn) @ (n_experts, d_cn, d_cn) -> (n_experts, batch, d_cn)
        E = x0 * (act(act(x @ V) @ C) @ U + bias)
        E = E.swapaxes(0, 1) # (batch, n_experts, d_cn)
        GE = np.sum(importance * E, axis = 1, keepdims = False) # (batch, d_cn)

        x = GE + x

    for W, bias in params['ff']:
        x = relu(x @ W + bias)

    return x @ params['W_out'] # (batch, 1)


import seaborn as sns
import matplotlib.pyplot as plt
def plot_heatmap(params, layer_idx=0):

    G, U, C, V, bias = params['cn'][layer_idx]

    d_cn, n_experts = G.shape
    mean_x = np.random.randn(1, d_cn)
    
    # (d_cn, n_experts) -> (n_experts)
    importance = softmax(np.sum(mean_x @ G, axis = 0, keepdims = False)).reshape(G.shape[1], 1, 1)

    W = V @ C @ U
    GE = np.sum(importance * W, axis = 0, keepdims = False)

    mat = np.abs(GE).round(2)
    
    plt.figure(figsize=(4, 4))
    sns.heatmap(mat, annot=True, cmap="YlGnBu", 
                xticklabels=[f"x{i}" for i in range(len(mat))], 
                yticklabels=[f"x{i}" for i in range(len(mat))])
    
    plt.title(f"Feature Interaction Importance (Layer {layer_idx})")
    plt.show()