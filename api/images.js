/**
 * 图片搜索代理 API
 * 调用免费图片API搜索配图
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { keyword = '', count = 6 } = req.query

  if (!keyword) {
    return res.status(400).json({ error: '请提供keyword参数' })
  }

  const imageCount = Math.min(parseInt(count) || 6, 12)

  try {
    // 尝试使用 Unsplash API
    const unsplashKey = process.env.VITE_UNSPLASH_ACCESS_KEY

    if (unsplashKey) {
      const images = await fetchUnsplash(keyword, imageCount, unsplashKey)
      if (images.length > 0) {
        return res.status(200).json({ images, source: 'unsplash' })
      }
    }

    // 尝试使用 Pexels API（免费）
    const pexelsKey = process.env.PEXELS_API_KEY
    if (pexelsKey) {
      const images = await fetchPexels(keyword, imageCount, pexelsKey)
      if (images.length > 0) {
        return res.status(200).json({ images, source: 'pexels' })
      }
    }

    // 降级：返回占位图
    const placeholderImages = generatePlaceholderImages(keyword, imageCount)
    res.status(200).json({ images: placeholderImages, source: 'placeholder' })

  } catch (error) {
    console.error('图片搜索失败:', error)
    const placeholderImages = generatePlaceholderImages(keyword, imageCount)
    res.status(200).json({ images: placeholderImages, source: 'placeholder' })
  }
}

async function fetchUnsplash(keyword, count, accessKey) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        },
        timeout: 8000
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return (data.results || []).map(img => ({
      url: img.urls?.regular || img.urls?.small || img.links?.download || '',
      thumb: img.urls?.thumb || img.urls?.small || '',
      alt: img.alt_description || img.description || keyword,
      width: img.width,
      height: img.height,
      author: img.user?.name || '',
      source: 'unsplash'
    }))
  } catch {
    return []
  }
}

async function fetchPexels(keyword, count, apiKey) {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': apiKey
        },
        timeout: 8000
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return (data.photos || []).map(img => ({
      url: img.src?.large || img.src?.medium || '',
      thumb: img.src?.small || img.src?.tiny || '',
      alt: img.alt || keyword,
      width: img.width,
      height: img.height,
      author: img.photographer || '',
      source: 'pexels'
    }))
  } catch {
    return []
  }
}

function generatePlaceholderImages(keyword, count) {
  const images = []
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F']
  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length]
    images.push({
      url: `https://placehold.co/800x400/${color}/FFFFFF?text=${encodeURIComponent(keyword)}`,
      thumb: `https://placehold.co/200x120/${color}/FFFFFF?text=${encodeURIComponent(keyword)}`,
      alt: `${keyword} - 配图${i + 1}`,
      width: 800,
      height: 400,
      author: '',
      source: 'placeholder'
    })
  }
  return images
}
