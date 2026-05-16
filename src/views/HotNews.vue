<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="md:hidden flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-900">🔥 热点发现</h1>
    </div>

    <!-- 搜索框 -->
    <div class="relative">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索热点新闻..."
        class="input-field pl-10"
        @keyup.enter="handleSearch"
      />
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <button
        v-if="searchKeyword"
        @click="searchKeyword = ''; loadHotNews()"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >✕</button>
    </div>

    <!-- Tab切换 -->
    <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key; loadHotNews()"
        class="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200"
        :class="activeTab === tab.key ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- 下拉刷新提示 -->
    <div v-if="isRefreshing" class="flex items-center justify-center py-2 text-sm text-primary-400">
      <svg class="animate-spin-slow w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      正在刷新...
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="card p-4 animate-pulse">
        <div class="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div class="flex space-x-2">
          <div class="h-4 bg-gray-200 rounded w-16"></div>
          <div class="h-4 bg-gray-200 rounded w-20"></div>
          <div class="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="newsList.length === 0" class="text-center py-16">
      <div class="text-5xl mb-4">📭</div>
      <p class="text-gray-500 mb-2">暂无热点数据</p>
      <button @click="loadHotNews" class="btn-primary text-sm">点击重试</button>
    </div>

    <!-- 热点新闻列表 -->
    <div v-else class="space-y-3">
      <div
        v-for="(news, index) in newsList"
        :key="news.id || index"
        class="card p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
        @click="goToRewrite(news)"
      >
        <div class="flex items-start space-x-3">
          <!-- 排名序号 -->
          <div
            class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
            :class="index < 3 ? 'bg-primary-400 text-white' : 'bg-gray-100 text-gray-500'"
          >
            {{ index + 1 }}
          </div>

          <div class="flex-1 min-w-0">
            <!-- 标题 -->
            <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
              {{ news.title }}
            </h3>

            <!-- 标签和信息 -->
            <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span v-if="news.hotLabel" class="badge-hot">{{ news.hotLabel }}</span>
              <span v-if="news.isNew" class="badge-new">新</span>
              <span v-if="news.category" class="badge-recommend">{{ news.category }}</span>
              <span>{{ news.source || '微博' }}</span>
              <span v-if="news.hotValue" class="text-primary-400 font-medium">
                🔥 {{ formatHotValue(news.hotValue) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-3 flex items-center justify-end space-x-2">
          <button
            @click.stop="goToRewrite(news)"
            class="btn-primary text-xs py-1.5 px-3"
          >
            ✍️ 改写此文
          </button>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="newsList.length > 0 && hasMore" class="text-center py-4">
      <button @click="loadMore" class="btn-ghost text-sm" :disabled="isLoadingMore">
        {{ isLoadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="text-center py-8">
      <div class="text-4xl mb-3">😕</div>
      <p class="text-gray-500 mb-2">{{ errorMsg }}</p>
      <button @click="loadHotNews" class="btn-primary text-sm">重新加载</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentArticleStore } from '../stores'

const router = useRouter()
const currentArticleStore = useCurrentArticleStore()

const searchKeyword = ref('')
const activeTab = ref('general')
const isLoading = ref(false)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const newsList = ref([])
const hasMore = ref(false)
const errorMsg = ref('')

const tabs = [
  { key: 'general', label: '综合热点', icon: '🔥' },
  { key: 'sports', label: '体育热点', icon: '⚽' },
]

function formatHotValue(value) {
  if (!value) return ''
  if (typeof value === 'number') {
    if (value >= 10000) return (value / 10000).toFixed(1) + '万'
    return value.toString()
  }
  return value
}

async function loadHotNews() {
  isLoading.value = true
  errorMsg.value = ''

  try {
    const response = await fetch(`/api/hotnews?type=${activeTab.value}&keyword=${encodeURIComponent(searchKeyword.value)}`)
    if (!response.ok) {
      throw new Error('获取热点数据失败')
    }
    const data = await response.json()
    newsList.value = data.list || []
    hasMore.value = data.hasMore || false
  } catch (error) {
    console.error('加载热点失败:', error)
    errorMsg.value = '获取热点数据失败，请检查网络连接'
    // 使用模拟数据
    newsList.value = getMockData()
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

function getMockData() {
  const generalNews = [
    { id: '1', title: '多地发布高温红色预警，气温突破40度大关', source: '中国天气网', hotValue: '589万', hotLabel: '热', category: '社会', isNew: true },
    { id: '2', title: '新能源汽车销量再创新高，国产品牌领跑全球市场', source: '经济日报', hotValue: '432万', hotLabel: '热', category: '财经' },
    { id: '3', title: '教育部发布新规：中小学课后服务全面升级', source: '教育部', hotValue: '387万', hotLabel: '新', category: '教育', isNew: true },
    { id: '4', title: '我国成功发射新一代通信卫星，技术再获突破', source: '新华社', hotValue: '356万', category: '科技' },
    { id: '5', title: '全国多地出台楼市新政，释放哪些重要信号', source: '央视新闻', hotValue: '298万', hotLabel: '热', category: '财经' },
    { id: '6', title: 'AI大模型竞争白热化，行业格局面临洗牌', source: '科技日报', hotValue: '276万', category: '科技' },
    { id: '7', title: '年轻人消费观念转变：从冲动消费到理性储蓄', source: '中国青年报', hotValue: '234万', category: '社会' },
    { id: '8', title: '健康饮食新趋势：轻食概念持续走热', source: '健康时报', hotValue: '198万', category: '生活' },
    { id: '9', title: '文旅市场持续火爆，小众目的地成为新宠', source: '文旅中国', hotValue: '167万', category: '文化', isNew: true },
    { id: '10', title: '数字人民币试点再扩大，应用场景日益丰富', source: '金融时报', hotValue: '145万', category: '财经' },
  ]

  const sportsNews = [
    { id: '11', title: '中国男足世预赛关键战即将打响', source: '体坛周报', hotValue: '445万', hotLabel: '热', category: '足球', isNew: true },
    { id: '12', title: 'NBA季后赛激战正酣，多支球队争夺总冠军', source: '新浪体育', hotValue: '378万', hotLabel: '热', category: '篮球' },
    { id: '13', title: '中国游泳队世锦赛再夺金牌，展现强劲实力', source: '央视体育', hotValue: '312万', category: '游泳' },
    { id: '14', title: '乒乓球世界杯：国乒包揽男女单冠军', source: '人民日报体育', hotValue: '289万', hotLabel: '新', category: '乒乓球', isNew: true },
    { id: '15', title: '电竞入亚运后热度持续攀升，产业发展加速', source: '电竞世界', hotValue: '234万', category: '电竞' },
    { id: '16', title: '马拉松赛事火爆全国，全民健身热潮涌动', source: '中国体育报', hotValue: '198万', category: '田径' },
    { id: '17', title: '中国女排新周期集训名单公布，多名新人入选', source: '排协官网', hotValue: '176万', category: '排球' },
    { id: '18', title: '冬奥冠军再创佳绩，冰雪运动热度不减', source: '冰雪中国', hotValue: '145万', category: '冰雪' },
  ]

  if (searchKeyword.value) {
    const all = [...generalNews, ...sportsNews]
    return all.filter(n => n.title.includes(searchKeyword.value))
  }

  return activeTab.value === 'sports' ? sportsNews : generalNews
}

function loadMore() {
  isLoadingMore.value = true
  setTimeout(() => {
    isLoadingMore.value = false
    hasMore.value = false
  }, 1000)
}

function handleSearch() {
  loadHotNews()
}

function goToRewrite(news) {
  currentArticleStore.set({
    id: Date.now().toString(),
    originalTitle: news.title,
    originalContent: news.summary || news.title + '。该话题在网络上引发了广泛关注和讨论，各界人士纷纷发表看法。随着事件的持续发酵，更多细节逐渐浮出水面，公众的关注度也在不断攀升。专家表示，这一现象背后折射出的深层次问题值得我们深入思考和探讨。',
    source: news.source,
    hotValue: news.hotValue,
    category: news.category,
  })
  router.push('/rewrite')
}

// 下拉刷新支持
let touchStartY = 0
onMounted(() => {
  loadHotNews()

  // 移动端下拉刷新
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY
  })
  document.addEventListener('touchend', (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY
    if (deltaY > 100 && window.scrollY === 0 && !isRefreshing.value) {
      isRefreshing.value = true
      loadHotNews()
    }
  })
})
</script>
