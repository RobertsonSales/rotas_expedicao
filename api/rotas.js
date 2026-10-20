/**
 * POST /api/rotas   ·   GET /api/rotas (teste de conexão)
 *
 * Serverless function (Vercel Node.js runtime) que liga a aplicação de
 * Planejamento de Rotas ao Google Apps Script da planilha
 * "GRUPO_LABMEDIC_Rotas_de_Entrega_Base" (Google Sheets).
 *
 * Variáveis de ambiente (Project Settings → Environment Variables):
 *   ROTAS_SCRIPT_URL  → URL do Aplicativo da Web do Apps Script (termina em /exec)
 *   ROTAS_API_TOKEN   → o mesmo texto da propriedade API_TOKEN do Apps Script
 *
 * O token NUNCA vai para o navegador: o front-end chama /api/rotas e esta
 * função acrescenta o token antes de repassar a chamada ao Apps Script.
 */
const ACOES = ['cadastro', 'listarRotas', 'salvarRota', 'excluirRota', 'salvarBase', 'salvarCoordenadas', 'salvarUnidade', 'versao'];

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const scriptUrl = process.env.ROTAS_SCRIPT_URL;
    const token = process.env.ROTAS_API_TOKEN || '';

    if (!scriptUrl) {
        res.status(500).json({ ok: false, error: 'ROTAS_SCRIPT_URL não está configurada nas variáveis de ambiente da Vercel.' });
        return;
    }

    let body = {};
    if (req.method === 'GET') {
        body = { action: 'versao' };
    } else if (req.method === 'POST') {
        body = req.body || {};
        if (typeof body === 'string') {
            try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; }
        }
    } else {
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ ok: false, error: 'Método não permitido.' });
        return;
    }

    if (!ACOES.includes(body.action)) {
        res.status(400).json({ ok: false, error: 'Ação inválida.' });
        return;
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 25000);
        /* text/plain evita o pré-voo CORS; o Apps Script responde com um
           redirecionamento 302 que o fetch segue automaticamente. */
        const upstream = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ ...body, token }),
            redirect: 'follow',
            signal: controller.signal
        });
        clearTimeout(timer);
        const text = await upstream.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            /* HTML no lugar de JSON = implantação sem acesso "Qualquer pessoa"
               ou URL errada (página de login/erro do Google). */
            res.status(502).json({
                ok: false,
                error: 'O Apps Script não respondeu em JSON. Confira se a implantação está como "Qualquer pessoa" e se ROTAS_SCRIPT_URL termina em /exec.',
                detalhe: text.slice(0, 300)
            });
            return;
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(504).json({
            ok: false,
            error: error && error.name === 'AbortError' ? 'O Apps Script demorou mais de 25 s para responder.' : 'Falha ao contatar o Apps Script: ' + (error && error.message ? error.message : error)
        });
    }
};
