/**
 * AI接口代理 API
 * 解决前端直接调用AI接口的跨域问题
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' })
  }

  const { apiUrl, apiKey, model, messages, temperature = 0.8 } = req.body

  if (!apiUrl || !apiKey || !model || !messages) {
    return res.status(400).json({ error: '缺少必要参数: apiUrl, apiKey, model, messages' })
  }

  try {
    // 构建请求URL
    let requestUrl = apiUrl
    if (!requestUrl.includes('/chat/completions')) {
      requestUrl = requestUrl.replace(/\/$/, '') + '/chat/completions'
    }

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: 2048
      }),
      timeout: 30000
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorMessage = `AI接口返回错误: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage
      } catch {}
      return res.status(response.status).json({
        error: errorMessage,
        status: response.status
      })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('AI代理请求失败:', error)
    res.status(500).json({
      error: 'AI接口请求失败: ' + (error.message || '未知错误'),
      status: 500
    })
  }
}
