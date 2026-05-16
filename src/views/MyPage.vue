<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="md:hidden">
      <h1 class="text-xl font-bold text-gray-900">📁 我的</h1>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 gap-3">
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-primary-400">{{ settingsStore.ruleRewriteCount }}</div>
        <div class="text-xs text-gray-500 mt-1">规则改写次数</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-blue-500">{{ settingsStore.aiRewriteCount }}</div>
        <div class="text-xs text-gray-500 mt-1">AI改写次数</div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        @click="activeTab = 'drafts'"
        class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'drafts' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        📝 草稿箱 ({{ drafts.length }})
      </button>
      <button
        @click="activeTab = 'published'"
        class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'published' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        ✅ 已发布 ({{ published.length }})
      </button>
    </div>

    <!-- 草稿列表 -->
    <div v-if="activeTab === 'drafts'">
      <div v-if="drafts.length === 0" class="text-center py-12">
        <div class="text-4xl mb-3">📭</div>
        <p class="text-gray-500 text-sm">暂无草稿</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="card p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0 cursor-pointer" @click="editDraft(draft)">
              <h3 class="font-semibold text-gray-900 text-sm line-clamp-1">{{ draft.title || draft.originalTitle || '无标题' }}</h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ (draft.content || draft.originalContent || '').substring(0, 100) }}</p>
              <p class="text-xs text-gray-400 mt-2">{{ formatTime(draft.updatedAt || draft.createdAt) }}</p>
            </div>
            <button
              @click="deleteDraft(draft.id)"
              class="text-gray-400 hover:text-red-500 transition-colors ml-2 p-1"
              title="删除"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已发布列表 -->
    <div v-if="activeTab === 'published'">
      <div v-if="published.length === 0" class="text-center py-12">
        <div class="text-4xl mb-3">📋</div>
        <p class="text-gray-500 text-sm">暂无已发布文章</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="item in published"
          :key="item.id + '-pub'"
          class="card p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 text-sm line-clamp-1">{{ item.title || '无标题' }}</h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ (item.content || '').substring(0, 100) }}</p>
              <p class="text-xs text-gray-400 mt-2">
                ✅ 已发布 · {{ formatTime(item.publishedAt) }}
              </p>
            </div>
            <button
              @click="deletePublished(item.id)"
              class="text-gray-400 hover:text-red-500 transition-colors ml-2 p-1"
              title="删除"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDraftsStore, useSettingsStore, useCurrentArticleStore } from '../stores'

const router = useRouter()
const draftsStore = useDraftsStore()
const settingsStore = useSettingsStore()
const currentArticleStore = useCurrentArticleStore()

const activeTab = ref('drafts')

const drafts = computed(() => draftsStore.getDrafts())
const published = computed(() => draftsStore.getPublished())

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}-${d}`
}

function editDraft(draft) {
  currentArticleStore.set({
    id: draft.id,
    originalTitle: draft.originalTitle || '',
    originalContent: draft.originalContent || '',
    rewrittenTitle: draft.title || '',
    rewrittenContent: draft.content || '',
    images: draft.images || [],
    source: draft.source || '',
  })
  router.push('/editor')
}

function deleteDraft(id) {
  if (confirm('确定删除此草稿？')) {
    draftsStore.deleteDraft(id)
  }
}

function deletePublished(id) {
  if (confirm('确定删除此记录？')) {
    draftsStore.deletePublished(id)
  }
}
</script>
