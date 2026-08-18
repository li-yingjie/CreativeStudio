const worker = {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/garuda' || url.pathname.startsWith('/garuda/')) {
      const path = url.pathname === '/garuda' ? '/garuda/index.html' : url.pathname
      const assetUrl = new URL(
        `https://cdn.jsdelivr.net/gh/li-yingjie/CreativeStudio@28700b6/public${path}`,
      )
      assetUrl.search = url.search

      const assetResponse = await fetch(new Request(assetUrl, request))
      if (!path.endsWith('.html')) {
        return assetResponse
      }

      const headers = new Headers(assetResponse.headers)
      headers.set('content-type', 'text/html; charset=utf-8')
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      })
    }

    const response = await env.ASSETS.fetch(request)

    if (response.status !== 404 || request.method !== 'GET') {
      return response
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html')
    if (!acceptsHtml) {
      return response
    }

    const fallbackUrl = new URL('/index.html', request.url)
    return env.ASSETS.fetch(new Request(fallbackUrl, request))
  },
}

export default worker
