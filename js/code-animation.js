// CONFIGURAÇÕES GLOBAIS
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
               "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dataAtual = new Date();
const mesAtual = meses[dataAtual.getMonth()];
const anoAtual = dataAtual.getFullYear();

// Dados do snippet de código
const codeSnippets = [
    { language: 'html', code: '<div class="container">\n  <h1>Meu Portfólio</h1>\n  <p>Bem-vindo</p>\n</div>' },
    { language: 'css', code: '.responsividade {\n  display: grid;\n  grid-template: auto 1fr 50px / 1fr 90vw 50px;\n  height: 100vh; \n  gap: 15px;}' },
    { language: 'javascript', code: 'function ola() {\n  console.log("Olá!");\n  return "Seja Bem Vindo!";\n}' }
];

// Variáveis de controle
let snippetIndex = 0;
let charIndex = 0;
let isDeleting = false;
let snakeInterval = null;
let gridData = [];
let usingRealData = false;

// Elementos DOM
let codeElement, canvas, ctx;

// ------------------------------------------------------------------
// FUNÇÃO PRINCIPAL: BUSCAR DADOS REAIS DA API
// ------------------------------------------------------------------

async function fetchRealContributions() {
    const username = 'SansaoYago';
    
    console.log('🔄 Buscando contribuições reais...');
    
    try {
        // API que está funcionando para você
        const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
        
        if (!response.ok) {
            throw new Error(`API falhou: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API respondeu com', data.contributions?.length || 0, 'semanas de dados');
        
        // Processar os dados da API
        return processAPIData(data);
        
    } catch (error) {
        console.log('❌ Erro na API:', error.message);
        return null;
    }
}

// ------------------------------------------------------------------
// PROCESSAR DADOS DA API ESPECÍFICA
// ------------------------------------------------------------------

function processAPIData(apiData) {
    if (!apiData.contributions || !Array.isArray(apiData.contributions)) {
        console.warn('Dados da API em formato inesperado');
        return null;
    }
    
    // Converter dados da API para formato simples: { "2026-01-20": 6, ... }
    const contributions = {};
    
    // A API retorna array de semanas, cada semana array de dias
    apiData.contributions.forEach(week => {
        if (Array.isArray(week)) {
            week.forEach(day => {
                if (day && day.date && day.contributionCount > 0) {
                    contributions[day.date] = day.contributionCount;
                }
            });
        }
    });
    
    console.log(`📊 ${Object.keys(contributions).length} dias com commits extraídos`);
    
    // Debug: mostrar commits do mês atual
    const currentYearMonth = `${anoAtual}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthCommits = Object.keys(contributions)
        .filter(date => date.startsWith(currentYearMonth))
        .map(date => `${date}: ${contributions[date]} commits`);
    
    if (currentMonthCommits.length > 0) {
        console.log('📅 Commits deste mês:', currentMonthCommits);
    }
    
    return contributions;
}

// ------------------------------------------------------------------
// FUNÇÃO MELHORADA: GERAR GRID COM DADOS DO MÊS ATUAL
// ------------------------------------------------------------------

function generateGridData(contributionsData = null) {
    const today = dataAtual;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    // Quantos dias tem o mês atual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Primeiro dia do mês
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDay = firstDay.getDay(); // 0=Domingo, 1=Segunda...
    
    // Calcular semanas necessárias
    const totalCells = daysInMonth + startingDay;
    const weeksNeeded = Math.ceil(totalCells / 7);
    
    // Criar grid vazio
    const grid = Array(weeksNeeded).fill().map(() => Array(7).fill(0));
    
    // Se tivermos dados reais da API
    if (contributionsData && Object.keys(contributionsData).length > 0) {
        console.log('🎯 Usando dados REAIS do GitHub!');
        usingRealData = true;
        
        let realCommitsCount = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            // Criar string de data no formato YYYY-MM-DD
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Posição no grid
            const cellIndex = startingDay + day - 1;
            const week = Math.floor(cellIndex / 7);
            const dayOfWeek = cellIndex % 7;
            
            // Verificar se há commits nesta data
            if (contributionsData[dateStr]) {
                const commitCount = contributionsData[dateStr];
                realCommitsCount++;
                
                // Converter quantidade de commits para nível 0-4
                let level = 0;
                if (commitCount >= 30) level = 4;
                else if (commitCount >= 20) level = 3;
                else if (commitCount >= 10) level = 2;
                else if (commitCount >= 1) level = 1;
                
                grid[week][dayOfWeek] = level;
                console.log(`✓ ${dateStr}: ${commitCount} commits → nível ${level}`);
            }
        }
        
        console.log(`📈 ${realCommitsCount} dias com commits reais neste mês`);
        
    } else {
        console.log('🎮 Usando dados simulados');
        usingRealData = false;
        
        // Dados simulados apenas para dias que já passaram
        for (let day = 1; day <= daysInMonth; day++) {
            const isPastDay = day <= currentDay;
            
            // Posição no grid
            const cellIndex = startingDay + day - 1;
            const week = Math.floor(cellIndex / 7);
            const dayOfWeek = cellIndex % 7;
            
            let level = 0;
            
            if (isPastDay) {
                // Padrão realista baseado em dias da semana
                const date = new Date(currentYear, currentMonth, day);
                const dayOfWeekNum = date.getDay(); // 0=Domingo, 6=Sábado
                
                // Mais commits durante a semana
                if (dayOfWeekNum >= 1 && dayOfWeekNum <= 4) { // Segunda a Quinta
                    if (Math.random() < 0.7) level = 1 + Math.floor(Math.random() * 2);
                } else if (dayOfWeekNum === 5) { // Sexta
                    if (Math.random() < 0.4) level = 1;
                }
                
                // Dias específicos com mais atividade
                if (day % 7 === 1) level = Math.min(4, level + 1); // Segundas
                if (day % 14 === 0) level = Math.min(4, level + 1); // A cada 2 semanas
            }
            
            grid[week][dayOfWeek] = level;
        }
    }
    
    return grid;
}

// ------------------------------------------------------------------
// FUNÇÕES DE ANIMAÇÃO (MANTIDAS)
// ------------------------------------------------------------------

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
    const dataSource = usingRealData ? '' : ' (Padrão Simulado)';
    const fraseMes = `// Contribuições: ${mesAtual} ${anoAtual}${dataSource}...`;
    
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

// ------------------------------------------------------------------
// ANIMAÇÃO DA COBRINHA (OTIMIZADA)
// ------------------------------------------------------------------

function iniciarCobra() {
    canvas.style.opacity = "0.8";
    
    const rows = 7;
    const cols = gridData.length;
    const size = 10;
    const gap = 3;
    
    canvas.width = cols * (size + gap);
    canvas.height = rows * (size + gap);
    
    let snake = { x: 0, y: 0 };
    let trail = [];
    
    drawRealGrid(snake, trail, rows, cols, size, gap);
    
    if (snakeInterval) clearInterval(snakeInterval);
    
    snakeInterval = setInterval(() => {
        moveRealSnake(snake, trail, rows, cols);
        drawRealGrid(snake, trail, rows, cols, size, gap);
        
        if (snake.x >= cols) {
            clearInterval(snakeInterval);
            snakeInterval = null;
            setTimeout(() => {
                canvas.style.opacity = "0";
                reiniciarCiclo();
            }, 2000);
        }
    }, 80); // Velocidade um pouco mais lenta para apreciar
}

function drawRealGrid(snake, trail, rows, cols, size, gap) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const level = gridData[x] ? gridData[x][y] : 0;
            const isSnakeHead = snake.x === x && snake.y === y;
            const hasBeenVisited = trail.some(t => t.x === x && t.y === y);
            
            let color;
            if (isSnakeHead) {
                color = '#ffffff'; // Cabeça branca brilhante
            } else if (hasBeenVisited) {
                // Após visita, mostra cor do commit
                color = getColorFromLevel(level);
            } else {
                color = 'rgba(0,0,0,0)'; // Invisível até ser visitado
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(x * (size + gap), y * (size + gap), size, size);
            
            // Adicionar leve brilho nos quadrados com commits
            if (hasBeenVisited && level > 0) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 3;
                ctx.fillRect(x * (size + gap), y * (size + gap), size, size);
                ctx.shadowBlur = 0;
            }
        }
    }
}

function moveRealSnake(snake, trail, rows, cols) {
    trail.push({ x: snake.x, y: snake.y });
    
    // Movimento em "z" (padrão do GitHub)
    if (snake.x % 2 === 0) {
        if (snake.y < rows - 1) snake.y++; else snake.x++;
    } else {
        if (snake.y > 0) snake.y--; else snake.x++;
    }
}

function getColorFromLevel(level) {
    // Cores do GitHub ajustadas para fundo escuro
    const colors = [
        '#161b2200',   // Nível 0
        '#0e4429',   // Nível 1 (1-9 commits)
        '#006d32',   // Nível 2 (10-19)
        '#26a641',   // Nível 3 (20-29)
        '#39d353'    // Nível 4 (30+)
    ];
    return colors[level] || colors[0];
}

function reiniciarCiclo() {
    charIndex = 0;
    isDeleting = false;
    codeElement.textContent = "";
    type();
}

// ------------------------------------------------------------------
// INICIALIZAÇÃO FINAL
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    codeElement = document.getElementById('animated-code');
    canvas = document.getElementById('snake-canvas');
    
    if (!codeElement || !canvas) {
        console.error('❌ Elementos não encontrados!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    console.log(`🚀 Inicializando para ${mesAtual} ${anoAtual}`);
    
    // 1. Iniciar animação do código IMEDIATAMENTE
    type();
    
    // 2. Começar com dados simulados (rápido)
    gridData = generateGridData();
    console.log('📋 Grid inicial criado:', gridData.length, 'semanas');
    
    // 3. Buscar dados reais em background
    setTimeout(async () => {
        try {
            console.log('🌐 Conectando ao GitHub...');
            const realData = await fetchRealContributions();
            
            if (realData) {
                console.log('✅ Dados reais obtidos com sucesso!');
                
                // Gerar novo grid com dados reais
                const newGrid = generateGridData(realData);
                
                // Verificar se há diferença
                const hasDifference = JSON.stringify(gridData) !== JSON.stringify(newGrid);
                
                if (hasDifference) {
                    console.log('🔄 Atualizando com dados reais...');
                    gridData = newGrid;
                    
                    // Se a cobrinha já estiver rodando, reiniciar com dados atualizados
                    if (snakeInterval) {
                        clearInterval(snakeInterval);
                        snakeInterval = null;
                        setTimeout(() => iniciarCobra(), 300);
                    }
                } else {
                    console.log('ℹ️ Dados já estão atualizados');
                }
            }
        } catch (error) {
            console.log('⚠️ Continuando com dados simulados:', error.message);
        }
    }, 1000); // Pequeno delay para não bloquear a UI
});