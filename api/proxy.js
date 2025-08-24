export const config = {
  runtime: 'edge', // chạy Edge nhanh hơn
};

export default async function handler(req) {
  const BACKEND = 'http://103.213.216.62:5000';
  const url = new URL(req.url);

  // target: http://103.213.216.62:5000/v1/order-tracking/...
  const target = BACKEND + url.pathname.replace(/^\/api\/proxy/, '') + url.search;

  // Nếu là preflight (OPTIONS) → trả về CORS ngay
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': req.headers.get('access-control-request-headers') || '*',
        'Access-Control-Max-Age': '86400'
      },
    });
  }

  // Forward request
  const headers = new Headers(req.headers);
  headers.delete('host'); // bỏ host header

  const resp = await fetch(target, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });

  // Copy header + thêm CORS
  const newHeaders = new Headers(resp.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Expose-Headers', '*');

  return new Response(resp.body, {
    status: resp.status,
    headers: newHeaders,
  });
}
