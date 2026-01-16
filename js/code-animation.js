// 1. Configurações Globais
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dataAtual = new Date();
const mesAtual = meses[dataAtual.getMonth()];

const codeSnippets = [
    { language: 'html', code: '<div class="container">\n  <h1>Meu Portfólio</h1>\n  <p>Bem-vindo</p>\n</div>' },
    { language: 'css', code: '.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}' },
    { language: 'javascript', code: 'function ola() {\n  console.log("Olá!");\n  return "Seja Bem Vindo!";\n}' }
];

let snippetIndex = 0;
let charIndex = 0;
let isDeleting = false;
let snakeInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    const codeElement = document.getElementById('animated-code');
    const canvas = document.getElementById('snake-canvas');
    if (!codeElement || !canvas) return;

    const ctx = canvas.getContext('2d');
    const rows = 7;
    const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();
    const primeiroDiaSemana = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).getDay();

    const cols = Math.ceil((ultimoDia + primeiroDiaSemana) / 7);
    const size = 10;
    const gap = 3;

    canvas.width = cols * (size + gap);
    canvas.height = rows * (size + gap);

    // GERAR GRID BASEADO NO MÊS REAL
    const gridData = Array.from({ length: cols }, (v, x) =>
        Array.from({ length: rows }, (v, y) => {
            const diaSerial = (x * 7 + y) - primeiroDiaSemana + 1;
            if (diaSerial > 0 && diaSerial <= ultimoDia) {
                // Mapa de commits baseado na sua imagem
                const diasComCommit = [1, 2, 4, 5, 8, 11, 12, 14, 15]; 
                return diasComCommit.includes(diaSerial) ? 1 : 0;
            }
            return -1;
        })
    );

    let snake = { x: 0, y: 0 };
    let trail = [];

    // --- FUNÇÕES CORRIGIDAS ---

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const val = gridData[x][y];
                const isSnakeHead = snake.x === x && snake.y === y;
                const hasBeenVisited = trail.some(t => t.x === x && t.y === y);

                if (isSnakeHead) {
                    ctx.fillStyle = '#ffffff';
                } else if (hasBeenVisited && val === 1) {
                    ctx.fillStyle = '#39d353';
                } else if (hasBeenVisited && val === 0) {
                    ctx.fillStyle = '#161b22';
                } else {
                    ctx.fillStyle = 'rgba(0,0,0,0)';
                }
                // Desenha o quadrado
                ctx.fillRect(x * (size + gap), y * (size + gap), size, size);
            }
        }
    }

    function moveSnake() {
        trail.push({ x: snake.x, y: snake.y });

        if (snake.x % 2 === 0) {
            if (snake.y < rows - 1) snake.y++; else snake.x++;
        } else {
            if (snake.y > 0) snake.y--; else snake.x++;
        }

        if (snake.x >= cols) {
            clearInterval(snakeInterval);
            snakeInterval = null;
            setTimeout(() => {
                canvas.style.opacity = "0";
                reiniciarCiclo();
            }, 2000);
        } else {
            draw();
        }
    }

    function type() {
        const current = codeSnippets[snippetIndex];
        const text = current.code;

        if (!isDeleting && charIndex <= text.length) {
            codeElement.textContent = text.substring(0, charIndex);
            charIndex++;
            setTimeout(type, 50);
        } else if (isDeleting && charIndex >= 0) {
            codeElement.textContent = text.substring(0, charIndex);
            charIndex--;
            setTimeout(type, 30);
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                snippetIndex++;
                if (snippetIndex >= codeSnippets.length) {
                    snippetIndex = 0;
                    digitarMes();
                    return;
                }
            }
            setTimeout(type, 1000);
        }
    }

    function digitarMes() {
        const fraseMes = `// Contribuições: ${mesAtual}...`;
        let i = 0;
        codeElement.textContent = "";

        function typing() {
            if (i <= fraseMes.length) {
                codeElement.textContent = fraseMes.substring(0, i);
                i++;
                setTimeout(typing, 80);
            } else {
                setTimeout(iniciarCobra, 500);
            }
        }
        typing();
    }

    function iniciarCobra() {
        canvas.style.opacity = "0.8";
        snake = { x: 0, y: 0 };
        trail = [];
        if (!snakeInterval) snakeInterval = setInterval(moveSnake, 60);
    }

    function reiniciarCiclo() {
        charIndex = 0;
        isDeleting = false;
        codeElement.textContent = "";
        type();
    }

    type(); // Inicia a execução corretamente
});