<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button @click="$router.push('/editor')" class="btn-ghost p-2 -ml-2 mr-1 md:hidden">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 class="text-xl font-bold text-gray-900">👁️ 文章预览</h1>
      </div>
    </div>

    <!-- 无文章提示 -->
    <div v-if="!currentArticle" class="text-center py-16">
      <div class="text-5xl mb-4">📄</div>
      <p class="text-gray-500">暂无文章可预览</p>
    </div>

    <template v-else>
      <!-- 模拟头条号文章展示效果 -->
      <div class="card max-w-2xl mx-auto">
        <!-- 文章标题 -->
        <div class="p-6 border-b border-gray-100">
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {{ articleTitle }}
          </h1>
          <div class="mt-3 flex items-center space-x-3 text-xs text-gray-400">
            <span>头条改写助手</span>
            <span>·</span>
            <span>{{ formatTime(new Date()) }}</span>
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="p-6">
          <div class="prose prose-sm max-w-none">
            <template v-for="(segment, idx) in contentSegments" :key="idx">
              <!-- 图片段 -->
              <div v-if="segment.type === 'image'" class="my-4">
                <img
                  :src="segment.url"
                  :alt="segment.caption || ''"
                  class="w-full rounded-lg"
                  @error="($event.target).style.display='none'"
                />
                <p v-if="segment.caption" class="text-xs text-gray-400 text-center mt-2">
                  {{ segment.caption }}
                </p>
              </div>
              <!-- 文字段 -->
              <p v-else class="text-gray-700 leading-relaxed mb-4 text-base">
                {{ segment.text }}
              </p>
            </template>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="max-w-2xl mx-auto">
        <div class="card p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button @click="copyTitle" class="btn-secondary text-xs py-2">
              📋 复制标题
            </button>
            <button @click="copyContent" class="btn-secondary text-xs py-2">
              📋 复制正文
            </button>
            <button @click="copyFullMarkdown" class="btn-primary text-xs py-2">
              📋 复制全文(MD)
            </button>
            <button @click="markAsPublished" class="btn-ghost text-xs py-2 text-green-600">
              ✅ 标记已发布
            </button>
          </div>

          <!-- 复制成功提示 -->
          <div v-if="copySuccess" class="mt-3 text-center text-sm text-green-500 font-medium">
            ✅ {{ copySuccess }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentArticleStore, useDraftsStore } from '../stores'

const router = useRouter()
const currentArticleStore = useCurrentArticleStore()
const draftsStore = useDraftsStore()

const currentArticle = computed(() => currentArticleStore.current)
const copySuccess = ref('')

const articleTitle = computed(() => {
  return currentArticle.value?.rewrittenTitle || currentArticle.value?.originalTitle || ''
})

const articleContent = computed(() => {
  return currentArticle.value?.rewrittenContent || currentArticle.value?.originalContent || ''
})

const articleImages = computed(() => {
  return currentArticle.value?.images || []
})

// 将文章内容拆分为文字段和图片段
const contentSegments = computed(() => {
  const segments = []
  const content = articleContent.value
  const images = articleImages.value

  // 按段落拆分
  const paragraphs = content.split('\n').filter(p => p.trim())

  let imageIdx = 0
  for (const para of paragraphs) {
    // 检测图片标记 [图片N]
    const imgMarkMatch = para.match(/^\[图片(\d+)\]$/)
    if (imgMarkMatch) {
      const imgNum = parseInt(imgMarkMatch[1]) - 1
      if (imgNum < images.length) {
        segments.push({
          type: 'image',
          url: images[imgNum].url,
          caption: images[imgNum].caption || ''
        })
      }
    } else {
      segments.push({ type: 'text', text: para })
    }

    // 每隔2-3段插入一张图片（如果有）
    if (segments.length % 3 === 0 && imageIdx < images.length && !imgMarkMatch) {
      segments.push({
        type: 'image',
        url: images[imageIdx].url,
        caption: images[imageIdx].caption || ''
      })
      imageIdx++
    }
  }

  // 如果还有未插入的图片，追加到末尾
  while (imageIdx < images.length) {
    segments.push({
      type: 'image',
      url: images[imageIdx].url,
      caption: images[imageIdx].caption || ''
    })
    imageIdx++
  }

  return segments
})

function formatTime(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  }
}

async function copyTitle() {
  await copyToClipboard(articleTitle.value)
  showCopySuccess('标题已复制')
}

async function copyContent() {
  await copyToClipboard(articleContent.value.replace(/\[图片\d+\]/g, '').trim())
  showCopySuccess('正文已复制')
}

async function copyFullMarkdown() {
  let md = `# ${articleTitle.value}\n\n`
  const content = articleContent.value
  const paragraphs = content.split('\n').filter(p => p.trim())
  let imageIdx = 0

  for (const para of paragraphs) {
    const imgMarkMatch = para.match(/^\[图片(\d+)\]$/)
    if (imgMarkMatch) {
      const imgNum = parseInt(imgMarkMatch[1]) - 1
      if (imgNum < articleImages.value.length) {
        const img = articleImages.value[imgNum]
        md += `![${img.caption || ''}](${img.url})\n\n`
      }
    } else {
      md += `${para}\n\n`
    }

    // 自动插入图片
    if (md.split('\n\n').length % 3 === 0 && imageIdx < articleImages.value.length && !imgMarkMatch) {
      const img = articleImages.value[imageIdx]
      md += `![${img.caption || ''}](${img.url})\n\n`
      imageIdx++
    }
  }

  // 追加剩余图片
  while (imageIdx < articleImages.value.length) {
    const img = articleImages.value[imageIdx]
    md += `![${img.caption || ''}](${img.url})\n\n`
    imageIdx++
  }

  await copyToClipboard(md.trim())
  showCopySuccess('全文(Markdown)已复制')
}

function markAsPublished() {
  if (currentArticle.value) {
    draftsStore.markAsPublished({
      id: currentArticle.value.id,
      title: articleTitle.value,
      content: articleContent.value,
      images: articleImages.value,
      originalTitle: currentArticle.value.originalTitle,
    })
    showCopySuccess('已标记为发布')
    setTimeout(() => {
      router.push('/my')
    }, 1000)
  }
}

function showCopySuccess(msg) {
  copySuccess.value = msg
  setTimeout(() => {
    copySuccess.value = ''
  }, 2000)
}
</script>
