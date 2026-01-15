// Snippets simples para teste
const codeSnippets = [
    {
        language: 'html',
        code: '<div class="container">\n  <h1>Meu Portfólio</h1>\n  <p>Bem-vindo ao meu site</p>\n</div>'
    },
    {
        language: 'css',
        code: '.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}'
    },
    {
        language: 'javascript',
        code: 'function saudacao() {\n  console.log("Olá, visitante!");\n  return "Bem-vindo";\n}'
    }
];

// Função básica de digitação
function typeCode() {
    const codeElement = document.getElementById('animated-code');
    if (!codeElement) return;
    
    let snippetIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const current = codeSnippets[snippetIndex];
        const text = current.code;
        
        if (!isDeleting && charIndex <= text.length) {
            // Digitando - preserva indentação
            codeElement.textContent = text.substring(0, charIndex);
            charIndex++;
            setTimeout(type, 50);
        } else if (isDeleting && charIndex >= 0) {
            // Apagando
            codeElement.textContent = text.substring(0, charIndex);
            charIndex--;
            setTimeout(type, 30);
        } else {
            // Troca
            isDeleting = !isDeleting;
            if (!isDeleting) {
                snippetIndex = (snippetIndex + 1) % codeSnippets.length;
            }
            setTimeout(type, 1000);
        }
    }
    
    type();
}

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', typeCode);