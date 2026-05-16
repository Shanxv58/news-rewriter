<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button @click="$router.push('/rewrite')" class="btn-ghost p-2 -ml-2 mr-1 md:hidden">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 class="text-xl font-bold text-gray-900">📝 文章编辑器</h1>
      </div>
      <div class="flex space-x-2">
        <button @click="saveDraft" class="btn-secondary text-xs py-1.5 px-3">💾 保存草稿</button>
        <button @click="$router.push('/preview')" class="btn-primary text-xs py-1.5 px-3">👁️ 预览</button>
      </div>
    </div>

    <!-- 无文章提示 -->
    <div v-if="!currentArticle" class="text-center py-16">
      <div class="text-5xl mb-4">📝</div>
      <p class="text-gray-500">暂无文章可编辑</p>
    </div>

    <template v-else>
      <!-- 标题编辑 -->
      <div class="card p-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">文章标题</label>
        <input
          v-model="articleTitle"
          type="text"
          class="input-field text-lg font-bold"
          placeholder="请输入文章标题"
        />
      </div>

      <!-- 工具栏 -->
      <div class="card">
        <div class="p-2 border-b border-gray-100 flex items-center space-x-1 overflow-x-auto">
          <button @click="insertFormat('**', '**')" class="btn-ghost text-xs py-1 px-2" title="加粗">
            <strong>B</strong>
          </button>
          <button @click="insertNewline" class="btn-ghost text-xs py-1 px-2" title="分段">
            ¶ 换段
          </button>
          <button @click="showImageSearch = !showImageSearch" class="btn-ghost text-xs py-1 px-2" title="插图">
            🖼️ 插图
          </button>
          <div class="flex-1"></div>
          <span class="text-xs text-gray-400">{{ articleContent.length }}字</span>
        </div>

        <!-- 正文编辑区 -->
        <textarea
          ref="contentTextarea"
          v-model="articleContent"
          class="w-full min-h-[300px] md:min-h-[400px] p-4 text-sm leading-relaxed border-none outline-none resize-y"
          placeholder="请输入或编辑文章内容..."
        ></textarea>
      </div>

      <!-- 图片搜索区 -->
      <div v-if="showImageSearch" class="card">
        <div class="p-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">🖼️ 搜索配图</h3>
        </div>
        <div class="p-4 space-y-3">
          <div class="flex space-x-2">
            <input
              v-model="imageKeyword"
              type="text"
              class="input-field flex-1"
              placeholder="输入图片搜索关键词..."
              @keyup.enter="searchImages"
            />
            <button @click="searchImages" class="btn-primary text-sm" :disabled="isSearchingImages">
              {{ isSearchingImages ? '搜索中...' : '🔍 搜索' }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="kw in autoKeywords"
              :key="kw"
              @click="imageKeyword = kw; searchImages()"
              class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full transition-colors"
            >
              {{ kw }}
            </button>
          </div>

          <!-- 搜索结果 -->
          <div v-if="isSearchingImages" class="flex justify-center py-8">
            <div class="w-8 h-8 border-2 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
          </div>

          <div v-else-if="searchedImages.length > 0" class="grid grid-cols-3 gap-2">
            <div
              v-for="(img, idx) in searchedImages"
              :key="idx"
              class="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
              @click="insertImage(img)"
            >
              <img
                :src="img.thumb || img.url"
                :alt="img.alt || ''"
                class="w-full h-24 object-cover"
                loading="lazy"
                @error="($event.target).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f3f4f6%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-size=%2214%22>无图片</text></svg>'"
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs">点击插入</span>
              </div>
            </div>
          </div>

          <div v-else-if="imageKeywordSearched && searchedImages.length === 0" class="text-center py-6 text-sm text-gray-400">
            未找到相关图片，换个关键词试试
          </div>
        </div>
      </div>

      <!-- 已插入的图片 -->
      <div v-if="articleImages.length > 0" class="card">
        <div class="p-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">📎 已插入图片 ({{ articleImages.length }})</h3>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="(img, idx) in articleImages" :key="idx" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <img :src="img.url" :alt="img.caption || ''" class="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <input
                v-model="img.caption"
                type="text"
                class="input-field text-xs mb-2"
                placeholder="图片说明（可选）"
              />
              <button @click="removeImage(idx)" class="text-xs text-red-500 hover:text-red-600">删除图片</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="flex flex-wrap gap-2 justify-center py-2">
        <button @click="saveDraft" class="btn-secondary">💾 保存草稿</button>
        <button @click="goToRewrite" class="btn-ghost">🔄 重新改写</button>
        <button @click="$router.push('/preview')" class="btn-primary">👁️ 预览文章</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentArticleStore, useDraftsStore } from '../stores'
import { searchImages as searchImagesApi } from '../utils/ai.js'

const router = useRouter()
const currentArticleStore = useCurrentArticleStore()
const draftsStore = useDraftsStore()

const currentArticle = computed(() => currentArticleStore.current)
const contentTextarea = ref(null)

const articleTitle = ref('')
const articleContent = ref('')
const articleImages = ref([])

const showImageSearch = ref(false)
const imageKeyword = ref('')
const isSearchingImages = ref(false)
const imageKeywordSearched = ref(false)
const searchedImages = ref([])

// 自动生成搜索关键词
const autoKeywords = computed(() => {
  if (!articleTitle.value) return []
  // 从标题提取关键词（简单分词）
  const stopWords = ['的', '了', '在', '是', '和', '与', '及', '等', '这', '那', '有', '为', '中', '被', '到', '对', '从', '以', '将', '会', '能', '就']
  const words = articleTitle.value.replace(/[，。！？、；：""''【】《》（）\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w))
  return words.slice(0, 5)
})

// 初始化
onMounted(() => {
  if (currentArticle.value) {
    articleTitle.value = currentArticle.value.rewrittenTitle || currentArticle.value.originalTitle || ''
    articleContent.value = currentArticle.value.rewrittenContent || currentArticle.value.originalContent || ''
    articleImages.value = currentArticle.value.images || []
  }
})

// 自动保存
watch([articleTitle, articleContent], () => {
  if (currentArticle.value) {
    currentArticleStore.set({
      ...currentArticle.value,
      rewrittenTitle: articleTitle.value,
      rewrittenContent: articleContent.value,
      images: articleImages.value,
    })
  }
})

function insertFormat(prefix, suffix) {
  const textarea = contentTextarea.value
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = articleContent.value.substring(start, end)
  const before = articleContent.value.substring(0, start)
  const after = articleContent.value.substring(end)
  articleContent.value = before + prefix + selected + suffix + after
  // 恢复光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
  }, 0)
}

function insertNewline() {
  const textarea = contentTextarea.value
  if (!textarea) return
  const pos = textarea.selectionStart
  const before = articleContent.value.substring(0, pos)
  const after = articleContent.value.substring(pos)
  articleContent.value = before + '\n\n' + after
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(pos + 2, pos + 2)
  }, 0)
}

async function searchImages() {
  if (!imageKeyword.value.trim()) return
  isSearchingImages.value = true
  imageKeywordSearched.value = false

  try {
    const images = await searchImagesApi(imageKeyword.value)
    searchedImages.value = images
  } catch (error) {
    console.error('图片搜索失败:', error)
    searchedImages.value = []
  } finally {
    isSearchingImages.value = false
    imageKeywordSearched.value = true
  }
}

function insertImage(img) {
  articleImages.value.push({
    url: img.url,
    thumb: img.thumb || img.url,
    caption: img.alt || '',
  })
  // 在正文中插入图片标记
  const imgMark = `\n[图片${articleImages.value.length}]`
  articleContent.value += imgMark
}

function removeImage(idx) {
  articleImages.value.splice(idx, 1)
}

function saveDraft() {
  const draft = {
    id: currentArticle.value?.id || Date.now().toString(),
    originalTitle: currentArticle.value?.originalTitle || '',
    originalContent: currentArticle.value?.originalContent || '',
    title: articleTitle.value,
    content: articleContent.value,
    images: [...articleImages.value],
    source: currentArticle.value?.source || '',
  }
  draftsStore.saveDraft(draft)
  alert('草稿已保存！')
}

function goToRewrite() {
  router.push('/rewrite')
}
</script>
