/**
 * 热点新闻抓取 API
 * 抓取微博热搜等公开数据
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { type = 'general', keyword = '' } = req.query

  try {
    let newsList = []

    if (type === 'general') {
      // 抓取微博热搜
      newsList = await fetchWeiboHot(keyword)
    } else if (type === 'sports') {
      // 抓取体育热点
      newsList = await fetchSportsHot(keyword)
    }

    res.status(200).json({
      success: true,
      list: newsList,
      hasMore: false,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('抓取热点失败:', error)
    // 返回模拟数据
    res.status(200).json({
      success: true,
      list: getFallbackData(type),
      hasMore: false,
      timestamp: new Date().toISOString(),
      fallback: true
    })
  }
}

async function fetchWeiboHot(keyword) {
  try {
    const response = await fetch('https://weibo.com/ajax/side/hotSearch', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 8000
    })

    if (!response.ok) {
      throw new Error(`微博热搜API返回${response.status}`)
    }

    const data = await response.json()
    const realtime = data.data?.realtime || []

    let list = realtime.map((item, idx) => ({
      id: `wb_${item.note || idx}`,
      title: item.note || item.word || '',
      hotValue: item.num || 0,
      hotLabel: getHotLabel(item.num),
      source: '微博',
      category: item.category || '',
      isNew: item.is_new === 1,
      url: item.url ? `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word || item.note)}` : ''
    }))

    // 关键词过滤
    if (keyword) {
      list = list.filter(item => item.title.includes(keyword))
    }

    return list.slice(0, 30)
  } catch (error) {
    console.error('微博热搜抓取失败:', error)
    throw error
  }
}

async function fetchSportsHot(keyword) {
  try {
    // 尝试抓取虎扑热门
    const response = await fetch('https://m.hupu.com/api/v1/bbs/hot', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        'Accept': 'application/json',
      },
      timeout: 8000
    })

    if (!response.ok) {
      throw new Error(`虎扑API返回${response.status}`)
    }

    const data = await response.json()
    const items = data.data?.list || data.data || []

    let list = items.map((item, idx) => ({
      id: `hupu_${item.id || idx}`,
      title: item.title || item.subject || '',
      hotValue: item.replies || item.views || 0,
      hotLabel: '体育',
      source: '虎扑',
      category: '体育',
      isNew: false,
      url: item.url || ''
    }))

    if (keyword) {
      list = list.filter(item => item.title.includes(keyword))
    }

    return list.slice(0, 20)
  } catch (error) {
    console.error('体育热点抓取失败:', error)
    throw error
  }
}

function getHotLabel(num) {
  if (!num) return ''
  if (num > 1000000) return '爆'
  if (num > 500000) return '热'
  if (num > 100000) return '新'
  return ''
}

function getFallbackData(type) {
  if (type === 'sports') {
    return [
      { id: 'f1', title: '中国男足世预赛关键战即将打响', source: '体育新闻', hotValue: '445万', hotLabel: '热', category: '足球', isNew: true },
      { id: 'f2', title: 'NBA季后赛激战正酣，多队争夺总冠军', source: '新浪体育', hotValue: '378万', hotLabel: '热', category: '篮球' },
      { id: 'f3', title: '中国游泳队世锦赛再夺金牌', source: '央视体育', hotValue: '312万', category: '游泳' },
      { id: 'f4', title: '乒乓球世界杯国乒包揽冠军', source: '人民日报', hotValue: '289万', hotLabel: '新', category: '乒乓球', isNew: true },
      { id: 'f5', title: '电竞入亚运后热度持续攀升', source: '电竞世界', hotValue: '234万', category: '电竞' },
      { id: 'f6', title: '马拉松赛事火爆全民健身热潮涌动', source: '中国体育报', hotValue: '198万', category: '田径' },
      { id: 'f7', title: '中国女排新周期集训名单公布', source: '排协', hotValue: '176万', category: '排球' },
      { id: 'f8', title: '冬奥冠军再创佳绩冰雪运动热度不减', source: '冰雪中国', hotValue: '145万', category: '冰雪' },
    ]
  }

  return [
    { id: 'f1', title: '多地发布高温红色预警，气温突破40度大关', source: '中国天气网', hotValue: '589万', hotLabel: '热', category: '社会', isNew: true },
    { id: 'f2', title: '新能源汽车销量再创新高国产品牌领跑全球', source: '经济日报', hotValue: '432万', hotLabel: '热', category: '财经' },
    { id: 'f3', title: '教育部发布新规中小学课后服务全面升级', source: '教育部', hotValue: '387万', hotLabel: '新', category: '教育', isNew: true },
    { id: 'f4', title: '我国成功发射新一代通信卫星技术再获突破', source: '新华社', hotValue: '356万', category: '科技' },
    { id: 'f5', title: '全国多地出台楼市新政释放哪些重要信号', source: '央视新闻', hotValue: '298万', hotLabel: '热', category: '财经' },
    { id: 'f6', title: 'AI大模型竞争白热化行业格局面临洗牌', source: '科技日报', hotValue: '276万', category: '科技' },
    { id: 'f7', title: '年轻人消费观念转变从冲动消费到理性储蓄', source: '中国青年报', hotValue: '234万', category: '社会' },
    { id: 'f8', title: '健康饮食新趋势轻食概念持续走热', source: '健康时报', hotValue: '198万', category: '生活' },
    { id: 'f9', title: '文旅市场持续火爆小众目的地成为新宠', source: '文旅中国', hotValue: '167万', category: '文化', isNew: true },
    { id: 'f10', title: '数字人民币试点再扩大应用场景日益丰富', source: '金融时报', hotValue: '145万', category: '财经' },
  ]
}
