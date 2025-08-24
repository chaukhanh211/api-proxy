// api/proxy.js
export const config = { runtime: 'edge' }; // chạy ở Edge, rất nhanh

function corsHeaders(req) {
  return new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': req.headers.get('access-control-request-headers') || '*',
    'Access-Control-Max-Age': '86400'
  });
}

export default async function handler(req) {
  // Đổi IP backend của bạn tại đây
  const BACKEND = 'http://103.213.216.62:5000';

  const url = new URL(req.url);
  // Map: /api/proxy/...  ->  http://IP:5000/...
  const target = BACKEND + url.pathname.replace(/^\/api\/proxy/, '') + url.search;

  // Trả lời preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  const headers = new Headers(req.headers);
  headers.delete('host');

  const bodyNeeded = !['GET', 'HEAD'].includes(req.method);
  const resp = await fetch(target, {
    method: req.method,
    headers,
    body: bodyNeeded ? await req.arrayBuffer() : undefined,
    redirect: 'manual'
  });

  const outHeaders = new Headers(resp.headers);
  outHeaders.set('Access-Control-Allow-Origin', '*');
  outHeaders.set('Access-Control-Expose-Headers', '*');

  return new Response(resp.body, { status: resp.status, headers: outHeaders });
}
