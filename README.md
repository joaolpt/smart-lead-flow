🚀 Mini-CRM | Triagem Inteligente de Leads

Um Customer Relationship Management (CRM) leve, reativo e focado em produtividade. Desenvolvido para automatizar o funil de vendas utilizando inteligência artificial, este projeto adota uma arquitetura de Single Page Application (SPA) construída inteiramente com Vanilla JavaScript, HTML5 e CSS3, dispensando a necessidade de frameworks pesados.

✨ Destaques e Funcionalidades

🤖 Triagem Automatizada via IA: Integração com webhooks (preparado para n8n) para analisar mensagens de clientes, definir prioridades (Alta, Média, Baixa) e sugerir abordagens comerciais.

🛤️ Arquitetura "Follow the Lead" (Máquina de Estados): O sistema dita a regra de negócio. Consoante o retorno da IA ou a ação do vendedor, o lead avança automaticamente de "Novo" -> "Triado pela IA" -> "Em atendimento" -> "Finalizado". Os botões ajustam-se dinamicamente para evitar falhas de processo.

⚡ Navegação SPA: Transições de ecrã e filtros instantâneos sem necessidade de recarregar a página.

🛡️ Segurança Front-end: Higienização rigorosa de inputs (XSS Prevention) antes da injeção no DOM.

💾 Resiliência de Cache: Utilização nativa do LocalStorage para persistência de dados e estado da aplicação sem depender de bases de dados externas.

🎨 UI/UX Focada: Interface responsiva, modais de confirmação customizados para ações destrutivas (exclusão bloqueada apenas para leads finalizados) e filtros em formato toggle.

🛠️ Tecnologias Utilizadas

Front-end: HTML5, CSS3, JavaScript (ES6+).

Automação/Integração: Webhooks via n8n (workflow template incluído).

Inteligência Artificial: Preparado para consumir APIs de LLMs (ex: Google Gemini) através do nó de integração.

🚀 Como Executar o Projeto

Como o projeto foi construído em Vanilla JS estático, não há necessidade de instalar dependências complexas (sem npm install).

Clone este repositório:

git clone https://github.com/seu-usuario/nome-do-repositorio.git


Navegue até a pasta do projeto e abra o ficheiro index.html em qualquer navegador web moderno.

A interface já estará 100% funcional com o armazenamento local ativo.

Configurando a Inteligência Artificial (Opcional)

Para testar a funcionalidade de "Analisar com IA", precisará de conectar o seu próprio Webhook:

Importe o ficheiro workflow-template.json (incluído neste repositório) para a sua instância do n8n.

Ative o workflow no n8n e copie a URL de produção do nó Webhook.

No ficheiro script.js, localize a constante na linha 2 e cole a sua URL:

const N8N_WEBHOOK_URL = "SUA_URL_DO_WEBHOOK_AQUI";


🗺️ Roadmap de Evolução

[ ] Substituir o LocalStorage por uma base de dados relacional (ex: PostgreSQL via Node.js/Express).

[ ] Implementar sistema de Autenticação (JWT) para múltiplos utilizadores/vendedores.

[ ] Adicionar gráficos ao painel para métricas de conversão.

🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request com melhorias, seja no design, na lógica de estados ou na adição de novas integrações de IA.