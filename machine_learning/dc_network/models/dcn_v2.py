from .common import np, create_mat, softmax, relu

def create_cross_net(d):
    W = create_mat((d, d))
    bias = np.zeros((1, d))
    return [W, bias]

def init_params(n_dense_features, d_embeddings = [], l_cn = 2, d_ff = -1 , l_ff = 2):
    # ======================
    # Get Input Size
    tot_emb_sz = sum(emb_sz for _, emb_sz in d_embeddings)
    d_cn = n_dense_features + tot_emb_sz

    # ======================
    # Set Free Variables
    if d_ff == -1: d_ff = 4 * d_cn

    # =======================
    # Layers

    emb_layers = [create_mat((vocab_size, emb_sz)) for vocab_size, emb_sz in d_embeddings]

    cn_layers = [create_cross_net(d_cn) for _ in range(l_cn)]

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
    
    for W, bias in params['cn']:
        x = x0 * (x @ W + bias) + x

    for W, bias in params['ff']:
        x = relu(x @ W + bias)

    return x @ params['W_out'] # (batch, 1)


import seaborn as sns
import matplotlib.pyplot as plt
def plot_heatmap(params, layer_idx=0):

    W, bias = params['cn'][layer_idx]

    mat = np.abs(W).round(2)
    plt.figure(figsize=(4, 4))
    sns.heatmap(mat, annot=True, cmap="YlGnBu", 
                xticklabels=[f"x{i}" for i in range(len(mat))], 
                yticklabels=[f"x{i}" for i in range(len(mat))])
    
    plt.title(f"Feature Interaction Importance (Layer {layer_idx})")
    plt.show()