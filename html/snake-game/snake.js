(function () {

    const TAM = 40;
    let FPS;
    let sumFPS;
    let quadro;
    let board;
    let snake;
    let pausado = false;
    let jogando = false;
    let intervalo;
    
    function initTela() {
        board = new Board();
        snake = new Snake();
        comida = new Comida();
        quadro = new Quadro();
    }
    function startGame() {
        document.getElementById("quadroPontuacao").remove();
        document.getElementById("board").remove();
        initTela();

        FPS = 8;
        sumFPS = 0;
        comida.geraComida();
        jogando = true;
        pausado = false;
        intervalo = window.setInterval(run, 1000/FPS);
    }
    function gameOver() {
        quadro.showGameOver();
        jogando = false;
        pausado = true;
        clearInterval(intervalo);
    }

    window.addEventListener("keydown", function(e) {
        switch(e.key) {            
            case "ArrowUp":
                snake.mudarDirecao(0);
                break;
            case "ArrowRight":
                snake.mudarDirecao(1);
                break;
            case "ArrowDown":
                snake.mudarDirecao(2);
                break;              
            case "ArrowLeft":
                snake.mudarDirecao(3);
                break;
            case "p":
            case "P":
                pausado = !pausado;
                break;             
            case "S":
            case "s":
                if(!jogando) startGame();
                break;
        }
    });
    
    class Quadro {
        constructor() {
            this.quadroDiv = document.createElement("div");
            this.quadroDiv.setAttribute('id','quadroPontuacao');
            this.quadroDiv.setAttribute('class','flex-container');
            this.quadroDiv.style.width = "600px";
            this.quadroDiv.style.display = 'flex';
            this.quadroDiv.style.justifyContent = 'space-between';
            this.quadroDiv.style.flexDirection = 'row';

            this.pontoDiv = document.createElement("div");
            this.gameOverDiv = document.createElement("div");

            this.pontos = 0;
            this.addPontos(0);

            this.quadroDiv.appendChild(this.pontoDiv);
            this.quadroDiv.appendChild(this.gameOverDiv);
            document.body.prepend(this.quadroDiv);
        }
        showGameOver() {
            this.gameOverDiv.innerHTML = "<h2>Fim do Jogo!</h2>"
        }
        transformaPonto(val) {
            let res = String(val);
            while(res.length < 4) res = "0" + res;
            return res;
        }
        addPontos(val){
            this.pontos += val;
            this.pontoDiv.innerHTML = "<h2>" + this.transformaPonto(this.pontos) + "</h2>";
        }
    }
    class Board {
        constructor() {
            this.element = document.createElement("table");
            this.element.setAttribute('id','board');
            this.cor = "#EEEEEE";
            for (let i = 0; i < TAM; i++) {
                let row = document.createElement("tr");
                for (let j = 0; j < TAM; j++) {
                    let campo = document.createElement("td");
                    row.appendChild(campo);
                }
                this.element.appendChild(row);
            }
            document.body.prepend(this.element);
        }
    }

    class Snake {
        constructor() {
            this.trocouDirecaoNoFrame = false;
            this.corpo = [[4,5],[4,6],[4,7]];
            this.cor = "#111111";
            this.direcao = 1; // 0:pracima; 1:pradireita; 2:prabaixo; 3:praesquerda
            this.corpo.forEach(campo => document.querySelector(`#board tr:nth-child(${campo[0]}) td:nth-child(${campo[1]})`).style.backgroundColor = this.cor);
        }
        andar() {
            let head = this.corpo[this.corpo.length-1];
            let add;
            switch(this.direcao) {
                case 0:
                    add = [head[0]-1,head[1]];
                   break;
                case 1:
                    add = [head[0],head[1]+1];
                    break;
                case 2:
                    add = [head[0]+1,head[1]];
                    break;  
                case 3:
                    add = [head[0],head[1]-1];
                    break;                                                            
            }
            if(this.morreu(add)) {
                gameOver();
                return;
            }

            this.corpo.push(add);
            document.querySelector(`#board tr:nth-child(${add[0]}) td:nth-child(${add[1]})`).style.backgroundColor = this.cor;

            let rem = this.corpo.shift();
            document.querySelector(`#board tr:nth-child(${rem[0]}) td:nth-child(${rem[1]})`).style.backgroundColor = board.cor;


            if(this.comeu()) {
                this.corpo.unshift(this.corpo[0]);
                quadro.addPontos(comida.valor);
                comida.geraComida();
            }
        }

        comeu() {
            let head = this.corpo[this.corpo.length-1];
            if(arrayEqual(head, comida.posicao)) return true;
            return false;
        }
        morreu(head) {
            if(Math.min(head[0], head[1]) <= 0 || Math.max(head[0], head[1]) > TAM) return true;
            for(let i=0; i+1<this.corpo.length; i++) {
                if(arrayEqual(this.corpo[i], head)) return true;
            }
            return false;
        }

        mudarDirecao(direcao) {
            if(this.direcao !== (direcao + 2)%4 && this.trocouDirecaoNoFrame === false) {
                this.direcao = direcao;
                this.trocouDirecaoNoFrame = true;
            }
        }
    }
    class Comida {
        constructor() {
            this.posicao = [];
            this.cor = "#111111";
        }
        geraComida () {
            let tentaGerar = true;
            let comidaPos;
            while (tentaGerar) {
                comidaPos = [getRandomInt(1,TAM), getRandomInt(1,TAM)];
                
                tentaGerar = false;
                snake.corpo.forEach(campo => {
                    if(arrayEqual(comidaPos, campo)) {
                        tentaGerar = true;
                    }
                });
            }
            this.posicao = comidaPos;
            this.valor = (getRandomInt(0,2) == 2)?2:1;

            if(this.valor === 1) this.cor = "#111111";
            else this.cor = "red";

            document.querySelector(`#board tr:nth-child(${comidaPos[0]}) td:nth-child(${comidaPos[1]})`).style.backgroundColor = this.cor;
        }
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }
    function arrayEqual(a, b) {
        if(a.length !== b.length) return false;
        for(let i=0; i<a.length; i++) if(a[i] !== b[i]) return false;
        return true;
    }

    function run () {
        if(!pausado) {
            snake.andar();
            snake.trocouDirecaoNoFrame = false;

            sumFPS++;
            if(sumFPS == 60) {
                sumFPS = 0;
                FPS++;
                clearInterval(intervalo);
                intervalo = window.setInterval(run, 1000/FPS);
            }
        }
    }

    initTela();
})();