/**
 * GET /api/maps-key
 *
 * Serverless function (Vercel Node.js runtime) que expõe a chave do
 * Google Maps armazenada na variável de ambiente GOOGLE_MAPS_API_KEY,
 * configurada em Project Settings → Environment Variables na Vercel.
 *
 * A chave NUNCA fica gravada no código-fonte nem no repositório: ela é
 * lida em tempo de execução a partir do ambiente do servidor. O
 * front-end (Rotas_Expedicao.html) busca este endpoint uma única vez,
 * ao iniciar, antes de carregar a API JavaScript do Google Maps.
 *
 * Importante: como a Maps JavaScript API roda no navegador, a chave
 * SEMPRE aparecerá no HTML/JS carregado e na aba de rede do navegador
 * — isso é inerente ao funcionamento do Google Maps e não é uma falha
 * desta função. A proteção real é feita no Google Cloud Console:
 *   1) restrinja a chave por "Referenciadores HTTP" aos domínios da
 *      Vercel (produção e prévias) e, se necessário, localhost;
 *   2) restrinja a chave a apenas as APIs usadas (Maps JavaScript API,
 *      Directions API, Geocoding API, Places API);
 *   3) configure cotas/alertas de faturamento no projeto do Google Cloud.
 */
module.exports = (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        res.setHeader('Cache-Control', 'no-store');
        res.status(404).json({
            error: 'GOOGLE_MAPS_API_KEY não está configurada nas variáveis de ambiente da Vercel.'
        });
        return;
    }

    // Nunca deixar este endpoint em cache de CDN/navegador.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
        apiKey
    });
};
