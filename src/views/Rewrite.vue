<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="md:hidden flex items-center">
      <button @click="$router.push('/')" class="btn-ghost p-2 -ml-2 mr-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <h1 class="text-xl font-bold text-gray-900">✍️ 改写工作台</h1>
    </div>

    <!-- 无文章提示 -->
    <div v-if="!currentArticle" class="text-center py-16">
      <div class="text-5xl mb-4">📝</div>
      <p class="text-gray-500 mb-4">请先从热点发现页选择一篇新闻</p>
      <button @click="$router.push('/')" class="btn-primary">去发现热点</button>
    </div>

    <template v-else>
      <div class="md:flex md:space-x-4 md:space-y-0 space-y-4">
        <!-- 左侧：原文展示区 -->
        <div class="md:w-1/2">
          <div class="card">
            <div class="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">📄 原文</h2>
              <button
                @click="showOriginal = !showOriginal"
                class="text-xs text-primary-400 hover:text-primary-500"
              >
                {{ showOriginal ? '收起' : '展开' }}
              </button>
            </div>
            <div v-show="showOriginal" class="p-4">
              <h3 class="font-bold text-gray-900 mb-3">{{ currentArticle.originalTitle }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{{ currentArticle.originalContent }}</p>
              <div v-if="currentArticle.source" class="mt-3 text-xs text-gray-400">
                来源：{{ currentArticle.source }}
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：改写设置 -->
        <div class="md:w-1/2">
          <div class="card">
            <div class="p-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-900">⚙️ 改写设置</h2>
            </div>
            <div class="p-4 space-y-5">
              <!-- 改写模式 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">改写模式</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="rewriteMode = 'rule'"
                    class="py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                    :class="rewriteMode === 'rule' ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                  >
                    🆓 规则改写
                    <div class="text-xs mt-0.5 opacity-70">免费·离线</div>
                  </button>
                  <button
                    @click="rewriteMode = 'ai'"
                    class="py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                    :class="rewriteMode === 'ai' ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                  >
                    🤖 AI改写
                    <div class="text-xs mt-0.5 opacity-70">需API Key</div>
                  </button>
                </div>
              </div>

              <!-- 改写风格 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">改写风格</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="s in styles"
                    :key="s.value"
                    @click="selectedStyle = s.value"
                    class="py-2 px-3 rounded-lg border text-sm transition-all"
                    :class="selectedStyle === s.value ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                  >
                    {{ s.icon }} {{ s.label }}
                  </button>
                </div>
              </div>

              <!-- 文章长度 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">文章长度</label>
                <div class="flex space-x-2">
                  <button
                    v-for="l in lengths"
                    :key="l.value"
                    @click="selectedLength = l.value"
                    class="flex-1 py-2 px-3 rounded-lg border text-sm transition-all"
                    :class="selectedLength === l.value ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                  >
                    {{ l.label }}
                  </button>
                </div>
              </div>

              <!-- 开关选项 -->
              <div class="space-y-3">
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm text-gray-700">添加开头引导语</span>
                  <div class="relative">
                    <input type="checkbox" v-model="addIntro" class="sr-only peer" />
                    <div class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-primary-400 transition-colors"></div>
                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm text-gray-700">添加个人观点</span>
                  <div class="relative">
                    <input type="checkbox" v-model="addOpinion" class="sr-only peer" />
                    <div class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-primary-400 transition-colors"></div>
                    <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 改写进度 -->
      <div v-if="isRewriting" class="card p-6">
        <div class="flex flex-col items-center space-y-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-400 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl">{{ rewriteProgress < 50 ? '🔄' : rewriteProgress < 80 ? '✍️' : '✅' }}</span>
            </div>
          </div>
          <div class="text-center">
            <p class="font-medium text-gray-900">{{ rewriteStatusText }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ Math.round(rewriteProgress) }}%</p>
          </div>
          <div class="w-full max-w-md bg-gray-100 rounded-full h-2">
            <div
              class="bg-primary-400 h-2 rounded-full transition-all duration-300"
              :style="{ width: rewriteProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 开始改写按钮 -->
      <div v-if="!isRewriting" class="flex justify-center">
        <button @click="startRewrite" class="btn-primary text-base py-3 px-8">
          🚀 开始改写
        </button>
      </div>

      <!-- 改写结果预览 -->
      <div v-if="rewriteResult && !isRewriting" class="card">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">✅ 改写完成</h2>
          <div class="flex space-x-2">
            <button @click="goToEditor" class="btn-primary text-xs py-1.5 px-3">
              进入编辑器
            </button>
            <button @click="startRewrite" class="btn-secondary text-xs py-1.5 px-3">
              重新改写
            </button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-900 mb-2 text-lg">{{ rewriteResult.title }}</h3>
          <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-6">{{ rewriteResult.content }}</p>
          <div v-if="rewriteResult.stats" class="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
            <span>同义词替换: {{ rewriteResult.stats.synonymReplaced }}处</span>
            <span>·</span>
            <span>原文{{ rewriteResult.stats.originalLength }}字 → 改写{{ rewriteResult.stats.newLength }}字</span>
            <span>·</span>
            <span>耗时{{ rewriteResult.stats.elapsed }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentArticleStore, useSettingsStore } from '../stores'
import { rewriteArticle } from '../utils/rewriter.js'
import { callAIRewrite } from '../utils/ai.js'

const router = useRouter()
const currentArticleStore = useCurrentArticleStore()
const settingsStore = useSettingsStore()

const currentArticle = computed(() => currentArticleStore.current)
const showOriginal = ref(true)
const rewriteMode = ref('rule')
const selectedStyle = ref(settingsStore.defaultStyle || 'formal')
const selectedLength = ref(settingsStore.defaultLength || 'medium')
const addIntro = ref(true)
const addOpinion = ref(false)
const isRewriting = ref(false)
const rewriteProgress = ref(0)
const rewriteResult = ref(null)

const styles = [
  { value: 'formal', label: '正式', icon: '📰' },
  { value: 'casual', label: '口语化', icon: '💬' },
  { value: 'analysis', label: '深度分析', icon: '🔍' },
  { value: 'sharp', label: '犀利评论', icon: '⚡' },
]

const lengths = [
  { value: 'short', label: '短文500字' },
  { value: 'medium', label: '中文1000字' },
  { value: 'long', label: '长文1500字' },
]

const rewriteStatusText = computed(() => {
  if (rewriteProgress.value < 20) return '正在分析原文...'
  if (rewriteProgress.value < 40) return '正在进行同义词替换...'
  if (rewriteProgress.value < 60) return '正在重组句式结构...'
  if (rewriteProgress.value < 80) return '正在调整段落逻辑...'
  if (rewriteProgress.value < 95) return '正在生成最终文章...'
  return '改写即将完成！'
})

async function startRewrite() {
  if (!currentArticle.value) return

  isRewriting.value = true
  rewriteResult.value = null
  rewriteProgress.value = 0

  const options = {
    style: selectedStyle.value,
    length: selectedLength.value,
    addIntro: addIntro.value,
    addOpinion: addOpinion.value,
    title: currentArticle.value.originalTitle
  }

  try {
    if (rewriteMode.value === 'rule') {
      // 规则改写 - 模拟进度
      const progressInterval = setInterval(() => {
        if (rewriteProgress.value < 90) {
          rewriteProgress.value += Math.random() * 15 + 5
        }
      }, 200)

      // 延迟执行以显示进度动画
      await new Promise(resolve => setTimeout(resolve, 500))

      const result = rewriteArticle(
        currentArticle.value.originalContent,
        options
      )

      clearInterval(progressInterval)
      rewriteProgress.value = 100

      await new Promise(resolve => setTimeout(resolve, 300))

      rewriteResult.value = result
      settingsStore.incrementRuleRewrite()
      settingsStore.save()

    } else {
      // AI改写
      if (!settingsStore.apiKey) {
        alert('请先在设置页面配置API Key')
        isRewriting.value = false
        return
      }

      const progressInterval = setInterval(() => {
        if (rewriteProgress.value < 85) {
          rewriteProgress.value += Math.random() * 8 + 2
        }
      }, 500)

      const result = await callAIRewrite(
        {
          apiKey: settingsStore.apiKey,
          apiUrl: settingsStore.aiApiUrl,
          model: settingsStore.aiModel,
        },
        currentArticle.value.originalTitle,
        currentArticle.value.originalContent,
        options
      )

      clearInterval(progressInterval)
      rewriteProgress.value = 100

      await new Promise(resolve => setTimeout(resolve, 300))

      rewriteResult.value = result
      settingsStore.incrementAiRewrite()
      settingsStore.save()
    }

    // 更新当前文章
    currentArticleStore.set({
      ...currentArticle.value,
      rewrittenTitle: rewriteResult.value.title,
      rewrittenContent: rewriteResult.value.content,
      rewriteMode: rewriteMode.value,
      rewriteStyle: selectedStyle.value,
      rewriteLength: selectedLength.value,
    })

  } catch (error) {
    console.error('改写失败:', error)
    alert('改写失败: ' + error.message)
  } finally {
    isRewriting.value = false
  }
}

function goToEditor() {
  router.push('/editor')
}
</script>
