const { Octokit } = require('@octokit/rest');
const fs = require('fs');

const GITHUB_TOKEN = 'seu-token-aqui'; // Token com permissões
const GIST_ID = 'seu-gist-id-aqui'; // ID do gist criado
const USERNAME = 'SansaoYago';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function updateContributions() {
  try {
    // Buscar eventos do GitHub
    const { data: events } = await octokit.activity.listEventsForUser({
      username: USERNAME,
      per_page: 100
    });

    // Processar dados
    const contributions = {};
    events.forEach(event => {
      if (event.type === 'PushEvent') {
        const date = event.created_at.split('T')[0];
        contributions[date] = (contributions[date] || 0) + 1;
      }
    });

    // Criar conteúdo do gist
    const content = {
      lastUpdated: new Date().toISOString(),
      contributions: contributions
    };

    // Atualizar gist
    await octokit.gists.update({
      gist_id: GIST_ID,
      files: {
        'github-contributions.json': {
          content: JSON.stringify(content, null, 2)
        }
      }
    });

    console.log('✅ Gist atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

updateContributions();