// URL Webhook n8n
const N8N_WEBHOOK_URL =
    "SUA_URL_DO_WEBHOOK_AQUI";

// 1. Resiliência de Armazenamento Local
let contatos = [];
try {
    const dadosSalvos = localStorage.getItem("crm_leads_data");
    if (dadosSalvos) {
        contatos = JSON.parse(dadosSalvos);
    }
} catch (error) {
    console.error(
        "Falha ao processar localStorage. Iniciando cache vazio.",
        error,
    );
    localStorage.removeItem("crm_leads_data");
}

let filtroStatus = "Novo";
let filtroPrioridade = "Todas";

// 2. Segurança: Prevenção Cross-Site Scripting (XSS)
const escapeHTML = (str) => {
    if (!str) return "";
    return String(str).replace(
        /[&<>'"]/g,
        (tag) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            })[tag],
    );
};

window.setFiltroStatus = function (status) {
    filtroStatus = status;
    renderizarTabela();
};

window.setFiltroPrioridade = function (prioridade, element) {
    // Se clicar no botão que já está ativo, remove o filtro
    if (filtroPrioridade === prioridade) {
        filtroPrioridade = "Todas";
        element.classList.remove("active");
    } else {
        // Caso contrário, aplica o novo filtro e desmarca os outros
        filtroPrioridade = prioridade;
        element.parentElement
            .querySelectorAll(".filter-tab")
            .forEach((btn) => btn.classList.remove("active"));
        if (element) element.classList.add("active");
    }
    renderizarTabela();
};

// Navegação SPA
function navegar(viewId, element) {
    document
        .querySelectorAll(".view-section")
        .forEach((el) => el.classList.remove("active"));
    document.getElementById(`view-${viewId}`).classList.add("active");

    document
        .querySelectorAll(".nav-link")
        .forEach((el) => el.classList.remove("active"));
    if (element) element.classList.add("active");

    document.getElementById("pageTitle").innerText =
        viewId === "painel" ? "Painel de Atendimentos" : "Novo Contato";

    // Força a aba "Novo" sempre que abrir o painel
    if (viewId === "painel") {
        filtroStatus = "Novo";
        const selectStatus = document.querySelector('.filter-select');
        if (selectStatus) selectStatus.value = "Novo";
        renderizarTabela();
    }

    if (window.innerWidth <= 768) toggleMenu();
}

function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const isOpen = sidebar.classList.toggle("open");

    document.getElementById("closeMenuBtn").style.display = isOpen ? "block" : "none";
    document.getElementById("openMenuBtn").style.display = isOpen ? "none" : "block";
}

// Lógica de Persistência
function guardarDados() {
    localStorage.setItem("crm_leads_data", JSON.stringify(contatos));
}

let contatoParaExcluir = null;

window.excluirContato = function (index) {
    contatoParaExcluir = index;
    document.getElementById('modalConfirmacao').style.display = 'flex';
};

window.fecharModalExclusao = function () {
    contatoParaExcluir = null;
    document.getElementById('modalConfirmacao').style.display = 'none';
};

window.confirmarExclusao = function () {
    if (contatoParaExcluir !== null) {
        contatos.splice(contatoParaExcluir, 1);
        guardarDados();
        renderizarTabela();
        fecharModalExclusao();
    }
};

function renderizarTabela() {
    const tbody = document.getElementById("corpoTabela");
    tbody.innerHTML = "";

    const contatosFiltrados = contatos.filter((contato) => {
        if (filtroStatus !== "Todos" && contato.status !== filtroStatus)
            return false;

        if (filtroPrioridade !== "Todas") {
            if (filtroPrioridade === "Pendentes") {
                if (contato.ia) return false;
            } else {
                if (!contato.ia) return false;
                const prioridadeIA = contato.ia.prioridade
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                if (prioridadeIA !== filtroPrioridade) return false;
            }
        }
        return true;
    });

    if (filtroStatus === "Finalizado") {
        contatosFiltrados.reverse();
    }

    if (contatosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum contato encontrado com estes filtros combinados.</td></tr>`;
        return;
    }

    contatosFiltrados.forEach((contato) => {
        const indexReal = contatos.indexOf(contato);
        const tr = document.createElement("tr");
        let blocoIA =
            '<span style="color: var(--text-muted); font-style: italic;">Aguardando análise...</span>';

        if (contato.ia) {
            const prioridadeClasse = contato.ia.prioridade
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            blocoIA = `
                <div class="ia-result">
                    <span class="badge ${prioridadeClasse}">${escapeHTML(contato.ia.prioridade)}</span><br>
                    <strong>Categoria:</strong> ${escapeHTML(contato.ia.categoria)}<br>
                    <div style="margin-top: 5px;"><strong>Sugestão:</strong> ${escapeHTML(contato.ia.resposta)}</div>
                </div>
            `;
        }

        // Lógica dos botões de ação com base na etapa do funil e no filtro ativo
        // Lógica dos botões de ação com base na etapa do funil e no filtro ativo
        let botoesAcao = '';

        if (filtroStatus === "Todos") {
            if (contato.status === "Novo") {
                botoesAcao = `<button class="btn-ia" disabled style="opacity: 0.5; cursor: not-allowed;">Analisar IA</button>`;
            } else if (contato.status === "Triado pela IA") {
                botoesAcao = `<button class="btn-ia" disabled style="background-color: #f59e0b; opacity: 0.5; cursor: not-allowed;">Atender Lead</button>`;
            } else if (contato.status === "Em atendimento") {
                botoesAcao = `<button class="btn-ia" disabled style="background-color: #10b981; opacity: 0.5; cursor: not-allowed;">Finalizar</button>`;
            } else if (contato.status === "Finalizado") {
                botoesAcao = `
                    <span style="color: var(--text-muted); font-size: 12px; font-weight: 600; display: block; margin-bottom: 8px;">✓ Concluído</span>
                    <button class="btn-ia" style="background-color: #ef4444;" onclick="excluirContato(${indexReal})">Excluir</button>
                `;
            }
        } else {
            if (contato.status === "Novo") {
                botoesAcao = `<button class="btn-ia" onclick="analisarIA(${indexReal})" id="btn-${indexReal}">Analisar IA</button>`;
            } else if (contato.status === "Triado pela IA") {
                botoesAcao = `<button class="btn-ia" style="background-color: #f59e0b;" onclick="mudarStatus(${indexReal}, 'Em atendimento')">Atender Lead</button>`;
            } else if (contato.status === "Em atendimento") {
                botoesAcao = `<button class="btn-ia" style="background-color: #10b981;" onclick="mudarStatus(${indexReal}, 'Finalizado')">Finalizar</button>`;
            } else if (contato.status === "Finalizado") {
                botoesAcao = `
                    <span style="color: var(--text-muted); font-size: 12px; font-weight: 600; display: block; margin-bottom: 8px;">✓ Concluído</span>
                    <button class="btn-ia" style="background-color: #ef4444;" onclick="excluirContato(${indexReal})">Excluir</button>
                `;
            }
        }

        // Injeção direta sem nenhuma linha "botoesAcao +=" sobrando
        tr.innerHTML = `
            <td><strong>${escapeHTML(contato.nome)}</strong><br><span style="color: var(--text-muted); font-size: 12px;">${escapeHTML(contato.whatsapp)}</span></td>
            <td>${escapeHTML(contato.mensagem)}</td>
            <td><span style="font-weight: 600; color: var(--primary);">${escapeHTML(contato.status)}</span></td>
            <td>${blocoIA}</td>
            <td>${botoesAcao}</td>
        `;

        tbody.appendChild(tr);
    });
}

document.getElementById("formContato").addEventListener("submit", function (e) {
    e.preventDefault();
    contatos.push({
        nome: document.getElementById("nome").value,
        whatsapp: document.getElementById("whatsapp").value,
        mensagem: document.getElementById("mensagem").value,
        status: "Novo",
        ia: null,
    });
    guardarDados();

    // Reseta filtros para garantir visualização do novo lead
    filtroStatus = "Novo";
    filtroPrioridade = "Todas";
    const selectStatus = document.querySelector('.filter-select');
    if (selectStatus) selectStatus.value = "Novo";
    document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
    const btnTodas = document.querySelector('.filter-tab[onclick*="Todas"]');
    if (btnTodas) btnTodas.classList.add('active');

    renderizarTabela();
    this.reset();
    navegar("painel", document.querySelector(".nav-link"));
});

window.mudarStatus = function (index, novoStatus) {
    contatos[index].status = novoStatus;

    // Acompanhamento Automático: Muda o filtro para a nova etapa
    filtroStatus = novoStatus;
    const selectStatus = document.querySelector('.filter-select');
    if (selectStatus) selectStatus.value = novoStatus;

    guardarDados();
    renderizarTabela();
};

window.analisarIA = async function (index) {
    if (!N8N_WEBHOOK_URL === "SUA_URL_DO_WEBHOOK_AQUI") { alert("Configure a URL do webhook do n8n no script.js"); return; }

    const btn = document.getElementById(`btn-${index}`);
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Processando...";
    }

    // 3. UX: Feedback Global de Rede
    document.body.style.cursor = "wait";

    try {
        const resposta = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: contatos[index].nome,
                whatsapp: contatos[index].whatsapp,
                mensagem: contatos[index].mensagem,
            }),
        });

        if (!resposta.ok) throw new Error("Falha na resposta do servidor n8n");

        const dadosIA = await resposta.json();
        contatos[index].ia = {
            categoria: dadosIA.categoria,
            prioridade: dadosIA.prioridade,
            resposta: dadosIA.resposta,
        };

        // Transição automática para a próxima fase do funil
        contatos[index].status = "Triado pela IA";

        // Acompanhamento Automático
        filtroStatus = "Triado pela IA";
        const selectStatus = document.querySelector('.filter-select');
        if (selectStatus) selectStatus.value = "Triado pela IA";

        guardarDados();
        renderizarTabela();
    } catch (erro) {
        console.error("Erro na integração AI:", erro);
        alert("Falha de conexão. Verifique se o n8n está rodando e acessível.");
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Analisar IA";
        }
    } finally {
        document.body.style.cursor = "default";
    }
};

renderizarTabela();