/**
 * AI改写模块 - 通过Serverless Function代理调用AI接口
 */

// 预设平台配置
export const aiPlatforms = {
  doubao: {
    name: '豆包(Ark)',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-pro-4k', 'doubao-pro-32k', 'doubao-pro-128k'],
    defaultModel: 'doubao-pro-32k'
  },
  qianwen: {
    name: '通义千问',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    defaultModel: 'qwen-plus'
  },
  deepseek: {
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
    defaultModel: 'deepseek-chat'
  },
  wenxin: {
    name: '百度文心',
    apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
    models: ['ernie-bot-4', 'ernie-bot-turbo', 'ernie-bot'],
    defaultModel: 'ernie-bot-4'
  },
  custom: {
    name: '自定义OpenAI兼容接口',
    apiUrl: '',
    models: [],
    defaultModel: ''
  }
}

/**
 * 构建改写Prompt
 */
function buildRewritePrompt(originalTitle, originalContent, options = {}) {
  const {
    style = 'formal',
    length = 'medium',
    addOpinion = false,
    addIntro = true
  } = options

  const styleMap = {
    formal: '正式严谨，适合新闻资讯类发布',
    casual: '口语化，通俗易懂，像和朋友聊天一样',
    analysis: '深度分析，有观点有深度，条理清晰',
    sharp: '犀利评论，一针见血，观点鲜明'
  }

  const lengthMap = {
    short: '500字左右的短文',
    medium: '1000字左右的中等长度文章',
    long: '1500字左右的长文'
  }

  const styleDesc = styleMap[style] || styleMap.formal
  const lengthDesc = lengthMap[length] || lengthMap.medium

  let prompt = `你是一个专业的新闻改写编辑。请根据以下原文，改写为一篇全新的原创文章。

改写要求：
1. 风格：${styleDesc}
2. 长度：${lengthDesc}
3. 必须与原文有显著差异，不能简单替换几个词
4. 需要重新组织文章结构，变换表达方式
5. 保留核心事实和信息准确性
6. 标题也需要改写，更有吸引力`

  if (addIntro) {
    prompt += '\n7. 需要添加一个吸引人的开头引导段落'
  }
  if (addOpinion) {
    prompt += '\n8. 在适当位置加入独到的个人观点和评论'
  }

  prompt += `\n\n原文标题：${originalTitle}\n\n原文内容：\n${originalContent}\n\n请按以下格式输出改写结果：\n【标题】改写后的标题\n【正文】改写后的正文内容`

  return prompt
}

/**
 * 通过Serverless Function代理调用AI改写
 */
export async function callAIRewrite(config, originalTitle, originalContent, options = {}) {
  const { apiKey, apiUrl, model } = config

  if (!apiKey) {
    throw new Error('请先配置API Key')
  }

  const prompt = buildRewritePrompt(originalTitle, originalContent, options)

  const messages = [
    {
      role: 'system',
      content: '你是一个专业的新闻改写编辑，擅长将新闻文章改写为高质量的原创内容。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]

  try {
    const response = await fetch('/api/proxy-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiUrl: apiUrl,
        apiKey: apiKey,
        model: model,
        messages: messages,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `AI接口返回错误: ${response.status}`)
    }

    const data = await response.json()

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResult = data.choices[0].message.content
      return parseAIResult(aiResult)
    } else if (data.result) {
      return parseAIResult(data.result)
    } else {
      throw new Error('AI返回数据格式异常')
    }
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('网络连接失败，请检查网络或API地址配置')
    }
    throw error
  }
}

/**
 * 解析AI返回的结果
 */
function parseAIResult(text) {
  let title = ''
  let content = text

  // 尝试提取标题
  const titleMatch = text.match(/【标题】(.+?)(?:\n|【)/)
  if (titleMatch) {
    title = titleMatch[1].trim()
  }

  // 尝试提取正文
  const contentMatch = text.match(/【正文】([\s\S]+)$/)
  if (contentMatch) {
    content = contentMatch[1].trim()
  }

  // 如果标题提取失败，取第一行
  if (!title) {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length > 1) {
      title = lines[0].replace(/^[【\[]/, '').replace(/[】\]]$/, '').trim()
      content = lines.slice(1).join('\n').trim()
    }
  }

  return { title, content }
}

/**
 * 搜索配图
 */
export async function searchImages(keyword, count = 6) {
  try {
    const response = await fetch(`/api/images?keyword=${encodeURIComponent(keyword)}&count=${count}`)
    if (!response.ok) {
      throw new Error('图片搜索失败')
    }
    const data = await response.json()
    return data.images || []
  } catch (error) {
    console.error('图片搜索错误:', error)
    return []
  }
}

export default callAIRewrite
