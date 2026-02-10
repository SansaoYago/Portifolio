// CONFIGURAÇÕES GLOBAIS
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
               "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dataAtual = new Date();
const mesAtual = meses[dataAtual.getMonth()];
const anoAtual = dataAtual.getFullYear();

// Variáveis globais
let codeSnippets = [];
let snippetIndex = 0;
let charIndex = 0;
let isDeleting = false;
let snakeInterval = null;
let gridData = [];
let usingRealData = false;
let isSnakeActive = false;

// Elementos DOM
let codeElement, canvas, ctx;

// Paleta de cores
const colors = {
  html: { tags: '#ff79c6', attributes: '#50fa7b', strings: '#f1fa8c', text: '#f8f8f2' },
  css: { selectors: '#ff79c6', properties: '#50fa7b', values: '#f1fa8c', units: '#bd93f9' },
  js: { keywords: '#ff79c6', functions: '#50fa7b', builtins: '#8be9fd', strings: '#f1fa8c' }
};

// ------------------------------------------------------------------
// CARREGAR SNIPPETS DO JSON
// ------------------------------------------------------------------

async function loadCodeSnippets() {
  try {
    const response = await fetch('data/code-snippets.json');
    if (!response.ok) throw new Error('Falha ao carregar snippets');
    
    const data = await response.json();
    codeSnippets = data.snippets;
    console.log(`✅ ${codeSnippets.length} snippets carregados do JSON`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao carregar snippets:', error);
    
    // Fallback: snippets padrão
    codeSnippets = [
      { 
        language: 'html', 
        code: '<div class="container">\n  <h1>Meu Portfólio</h1>\n  <p>Bem-vindo</p>\n</div>'
      },
      { 
        language: 'css', 
        code: '.responsividade {\n  display: grid;\n  grid-template-row: auto 1fr 50px;\n  grid-template-column: 1fr 90vw 50px;\n  height: 100vh; \n  gap: 15px;\n}'
      },
      { 
        language: 'javascript', 
        code: 'function ola() {\n  console.log("Olá!");\n  return "Seja Bem Vindo!";\n}'
      }
    ];
    
    return false;
  }
}

// ------------------------------------------------------------------
// HIGHLIGHT BASEADO NAS REGRAS DO JSON
// ------------------------------------------------------------------

function highlightFromRules(text, snippet) {
  if (!text || !snippet.highlightRules) {
    return escapeHTML(text);
  }
  
  let result = escapeHTML(text);
  const rules = snippet.highlightRules;
  const lang = snippet.language;
  
  // Aplicar regras específicas por linguagem
  if (lang === 'html') {
    // Tags
    rules.tags?.forEach(tag => {
      result = result.replace(
        new RegExp(`&lt;${tag}(?![\\w-])|&lt;\\/${tag}(?![\\w-])`, 'g'),
        match => match.replace(tag, `<span style="color:${colors.html.tags}">${tag}</span>`)
      );
    });
    
    // Atributos
    rules.attributes?.forEach(attr => {
      result = result.replace(
        new RegExp(`\\s${attr}=`, 'g'),
        ` <span style="color:${colors.html.attributes}">${attr}</span>=`
      );
    });
    
    // Strings
    rules.strings?.forEach(str => {
      result = result.replace(
        new RegExp(`"${str}"`, 'g'),
        `<span style="color:${colors.html.strings}">"${str}"</span>`
      );
    });
    
  } else if (lang === 'css') {
    // Seletores
    rules.selectors?.forEach(selector => {
      result = result.replace(
        new RegExp(selector.replace('.', '\\.'), 'g'),
        `<span style="color:${colors.css.selectors}">${selector}</span>`
      );
    });
    
    // Propriedades
    rules.properties?.forEach(prop => {
      result = result.replace(
        new RegExp(`${prop}(?=\\s*:)`, 'g'),
        `<span style="color:${colors.css.properties}">${prop}</span>`
      );
    });
    
    // Valores
    rules.values?.forEach(value => {
      result = result.replace(
        new RegExp(`\\b${value}\\b`, 'g'),
        `<span style="color:${colors.css.values}">${value}</span>`
      );
    });
    
    // Unidades
    rules.units?.forEach(unit => {
      result = result.replace(
        new RegExp(`(\\d+)(${unit})(?![\\w-])`, 'g'),
        `<span style="color:${colors.css.values}">$1</span><span style="color:${colors.css.units}">$2</span>`
      );
    });
    
  } else if (lang === 'javascript') {
    // Palavras-chave
    rules.keywords?.forEach(keyword => {
      result = result.replace(
        new RegExp(`\\b${keyword}\\b`, 'g'),
        `<span style="color:${colors.js.keywords}">${keyword}</span>`
      );
    });
    
    // Funções
    rules.functions?.forEach(func => {
      result = result.replace(
        new RegExp(`\\b${func}(?=\\s*\\()`, 'g'),
        `<span style="color:${colors.js.functions}">${func}</span>`
      );
    });
    
    // Built-ins
    rules.builtins?.forEach(builtin => {
      result = result.replace(
        new RegExp(`\\b${builtin}\\b`, 'g'),
        `<span style="color:${colors.js.builtins}">${builtin}</span>`
      );
    });
    
    // Strings
    rules.strings?.forEach(str => {
      result = result.replace(
        new RegExp(`"${str}"`, 'g'),
        `<span style="color:${colors.js.strings}">"${str}"</span>`
      );
    });
  }
  
  return result;
}

// Função auxiliar de escape
function escapeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/  /g, '&nbsp;&nbsp;');
}

// ------------------------------------------------------------------
// FUNÇÃO DE ANIMAÇÃO - CORRIGIDA PARA O FLUXO CORRETO
// ------------------------------------------------------------------

function type() {
  if (codeSnippets.length === 0) return;
  
  const current = codeSnippets[snippetIndex];
  const text = current.code;

  if (!isDeleting && charIndex <= text.length) {
    const partialText = text.substring(0, charIndex);
    const highlighted = highlightFromRules(partialText, current);
    codeElement.innerHTML = highlighted ;
    charIndex++;
    setTimeout(type, 50);
  } else if (isDeleting && charIndex >= 0) {
    const partialText = text.substring(0, charIndex);
    const highlighted = highlightFromRules(partialText, current);
    codeElement.innerHTML = highlighted;
    charIndex--;
    setTimeout(type, 30);
  } else {
    isDeleting = !isDeleting;
    if (!isDeleting) {
      snippetIndex++;
      
      // VERIFICAÇÃO CRÍTICA: Se chegou no último snippet (JavaScript)
      if (snippetIndex >= codeSnippets.length) {
        console.log('✅ Todos os snippets foram exibidos. Iniciando mensagem do GitHub...');
        snippetIndex = 0; // Reset para o próximo ciclo
        digitarMes(); // Chama a mensagem do GitHub
        return;
      }
      
      setTimeout(type, 1000);
    } else {
      setTimeout(type, 500);
    }
  }
}

// ------------------------------------------------------------------
// FUNÇÕES DO GITHUB
// ------------------------------------------------------------------

async function fetchRealContributions() {
  const username = 'SansaoYago';
  
  try {
    const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
    if (!response.ok) throw new Error(`API falhou: ${response.status}`);
    
    const data = await response.json();
    console.log('✅ Dados do GitHub carregados');
    return processAPIData(data);
  } catch (error) {
    console.log('⚠️ Erro na API:', error.message);
    return null;
  }
}

function processAPIData(apiData) {
  if (!apiData.contributions || !Array.isArray(apiData.contributions)) {
    console.warn('Formato de dados inesperado da API');
    return null;
  }
  
  const contributions = {};
  apiData.contributions.forEach(week => {
    if (Array.isArray(week)) {
      week.forEach(day => {
        if (day && day.date && day.contributionCount > 0) {
          contributions[day.date] = day.contributionCount;
        }
      });
    }
  });
  
  console.log(`📊 ${Object.keys(contributions).length} dias com commits`);
  return contributions;
}

function generateGridData(contributionsData = null) {
  const today = dataAtual;
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDay = firstDay.getDay();
  const totalCells = daysInMonth + startingDay;
  const weeksNeeded = Math.ceil(totalCells / 7);
  
  const grid = Array(weeksNeeded).fill().map(() => Array(7).fill(0));
  
  if (contributionsData && Object.keys(contributionsData).length > 0) {
    console.log('🎯 Usando dados REAIS do GitHub!');
    usingRealData = true;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellIndex = startingDay + day - 1;
      const week = Math.floor(cellIndex / 7);
      const dayOfWeek = cellIndex % 7;
      
      if (contributionsData[dateStr]) {
        const commitCount = contributionsData[dateStr];
        let level = 0;
        if (commitCount >= 30) level = 4;
        else if (commitCount >= 20) level = 3;
        else if (commitCount >= 10) level = 2;
        else if (commitCount >= 1) level = 1;
        
        if (week < weeksNeeded && dayOfWeek < 7) {
          grid[week][dayOfWeek] = level;
        }
      }
    }
    
  } else {
    console.log('🎮 Usando dados simulados');
    usingRealData = false;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isPastDay = day <= currentDay;
      const cellIndex = startingDay + day - 1;
      const week = Math.floor(cellIndex / 7);
      const dayOfWeek = cellIndex % 7;
      
      if (isPastDay && week < weeksNeeded && dayOfWeek < 7) {
        if (Math.random() > 0.3) {
          grid[week][dayOfWeek] = 1 + Math.floor(Math.random() * 3);
        }
      }
    }
  }
  
  console.log('Grid gerado com', grid.length, 'semanas');
  return grid;
}

// ------------------------------------------------------------------
// MENSAGEM DO GITHUB E ANIMAÇÃO DA COBRINHA
// ------------------------------------------------------------------

function digitarMes() {
  isSnakeActive = true;
  const dataSource = usingRealData ? '' : ' (Padrão Simulado)';
  const fraseMes = `// Contribuições: ${mesAtual} ${anoAtual}${dataSource}...`;
  
  let i = 0;
  codeElement.innerHTML = '';

  function typing() {
    if (i <= fraseMes.length) {
      const texto = fraseMes.substring(0, i);
      codeElement.innerHTML = `<span style="color:#8be9fd">${texto}</span><span class="blinking-cursor"></span>`;
      i++;
      setTimeout(typing, 80);
    } else {
      console.log('🐍 Iniciando animação da cobrinha...');
      setTimeout(iniciarCobra, 1000); // Pequena pausa antes da cobrinha
    }
  }
  typing();
}

function iniciarCobra() {
  if (!canvas || !gridData || gridData.length === 0) {
    console.error('Não foi possível iniciar a cobrinha');
    reiniciarCiclo();
    return;
  }
  
  console.log('🐍 Animação da cobrinha iniciada!');
  canvas.style.opacity = "1";
  canvas.style.display = "block";
  
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
      console.log('✅ Cobrinha completou o percurso!');
      clearInterval(snakeInterval);
      snakeInterval = null;
      setTimeout(() => {
        canvas.style.opacity = "0";
        setTimeout(() => {
          canvas.style.display = "none";
          reiniciarCiclo();
        }, 1000);
      }, 2000);
    }
  }, 80);
}

function drawRealGrid(snake, trail, rows, cols, size, gap) {
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let week = 0; week < cols; week++) {
    for (let day = 0; day < rows; day++) {
      const level = gridData[week] ? gridData[week][day] : 0;
      const isSnakeHead = snake.x === week && snake.y === day;
      const hasBeenVisited = trail.some(t => t.x === week && t.y === day);
      
      let color;
      if (isSnakeHead) {
        color = '#ffffff';
      } else if (hasBeenVisited) {
        color = getColorFromLevel(level);
      } else {
        color = 'rgba(0,0,0,0)';
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(week * (size + gap), day * (size + gap), size, size);
      
      if (hasBeenVisited && level > 0) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 3;
        ctx.fillRect(week * (size + gap), day * (size + gap), size, size);
        ctx.shadowBlur = 0;
      }
    }
  }
}

function moveRealSnake(snake, trail, rows, cols) {
  trail.push({ x: snake.x, y: snake.y });
  
  if (snake.x % 2 === 0) {
    if (snake.y < rows - 1) {
      snake.y++;
    } else {
      snake.x++;
    }
  } else {
    if (snake.y > 0) {
      snake.y--;
    } else {
      snake.x++;
    }
  }
}

function getColorFromLevel(level) {
  const colors = [
    '#161b2200',
    '#0e4429',
    '#006d32',
    '#26a641',
    '#39d353'
  ];
  return colors[level] || colors[0];
}

function reiniciarCiclo() {
  console.log('🔄 Reiniciando ciclo completo...');
  charIndex = 0;
  isDeleting = false;
  snippetIndex = 0;
  isSnakeActive = false;
  
  
  // Pequena pausa antes de recomeçar
  setTimeout(() => {
    console.log('⌨️ Reiniciando digitação dos snippets...');
    type();
  }, 2000);
}

// ------------------------------------------------------------------
// INICIALIZAÇÃO PRINCIPAL
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando portfólio...');
  
  codeElement = document.getElementById('animated-code');
  canvas = document.getElementById('snake-canvas');
  
  if (!codeElement) {
    console.error('❌ Elemento #animated-code não encontrado!');
    return;
  }
  
  if (!canvas) {
    console.warn('⚠️ Canvas não encontrado, cobrinha não funcionará');
  } else {
    ctx = canvas.getContext('2d');
    canvas.style.display = "none"; // Começa escondido
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 1s";
  }
  
  // 1. Carregar snippets
  console.log('📂 Carregando snippets...');
  await loadCodeSnippets();
  
  // 2. Gerar grid (inicialmente com dados simulados)
  console.log('📊 Gerando grid inicial...');
  gridData = generateGridData();
  
  // 3. Iniciar animação dos snippets
  console.log('⌨️ Iniciando animação de código...');
  type();
  
  // 4. Buscar dados reais em background
  setTimeout(async () => {
    try {
      console.log('🌐 Buscando dados do GitHub...');
      const realData = await fetchRealContributions();
      
      if (realData) {
        console.log('🔄 Atualizando grid com dados reais...');
        gridData = generateGridData(realData);
        
        // Se a cobrinha já estiver ativa, reiniciar com novos dados
        if (isSnakeActive && snakeInterval) {
          console.log('🔄 Atualizando cobrinha em tempo real...');
          clearInterval(snakeInterval);
          snakeInterval = null;
          setTimeout(() => iniciarCobra(), 500);
        }
      }
    } catch (error) {
      console.log('⚠️ Continuando com dados simulados');
    }
  }, 1500);
});