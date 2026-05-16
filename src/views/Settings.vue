<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="md:hidden">
      <h1 class="text-xl font-bold text-gray-900">⚙️ 设置</h1>
    </div>

    <!-- AI API 配置 -->
    <div class="card">
      <div class="p-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-900">🤖 AI API 配置</h2>
        <p class="text-xs text-gray-500 mt-1">配置后可使用AI改写功能，不配置则只能使用免费规则改写</p>
      </div>
      <div class="p-4 space-y-4">
        <!-- 选择平台 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">AI平台</label>
          <select v-model="settings.aiProvider" @change="onPlatformChange" class="select-field">
            <option v-for="(platform, key) in platforms" :key="key" :value="key">
              {{ platform.name }}
            </option>
          </select>
        </div>

        <!-- API Key -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <div class="relative">
            <input
              v-model="settings.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              class="input-field pr-10"
              placeholder="请输入API Key"
            />
            <button
              @click="showApiKey = !showApiKey"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {{ showApiKey ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- 模型 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
          <div v-if="currentPlatformModels.length > 0" class="flex flex-wrap gap-2 mb-2">
            <button
              v-for="model in currentPlatformModels"
              :key="model"
              @click="settings.aiModel = model"
              class="text-xs py-1 px-2 rounded-full border transition-all"
              :class="settings.aiModel === model ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              {{ model }}
            </button>
          </div>
          <input
            v-model="settings.aiModel"
            type="text"
            class="input-field"
            placeholder="模型名称"
          />
        </div>

        <!-- API地址 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API地址</label>
          <input
            v-model="settings.aiApiUrl"
            type="text"
            class="input-field"
            placeholder="API地址"
            :disabled="settings.aiProvider !== 'custom'"
          />
          <p v-if="settings.aiProvider !== 'custom'" class="text-xs text-gray-400 mt-1">
            切换到"自定义接口"可修改API地址
          </p>
        </div>

        <!-- 保存按钮 -->
        <button @click="saveAIConfig" class="btn-primary w-full">保存AI配置</button>
      </div>
    </div>

    <!-- 默认改写设置 -->
    <div class="card">
      <div class="p-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-900">✍️ 默认改写设置</h2>
      </div>
      <div class="p-4 space-y-4">
        <!-- 默认风格 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">默认改写风格</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in styles"
              :key="s.value"
              @click="settings.defaultStyle = s.value"
              class="py-2 px-3 rounded-lg border text-sm transition-all"
              :class="settings.defaultStyle === s.value ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
            >
              {{ s.icon }} {{ s.label }}
            </button>
          </div>
        </div>

        <!-- 默认长度 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">默认文章长度</label>
          <div class="flex space-x-2">
            <button
              v-for="l in lengths"
              :key="l.value"
              @click="settings.defaultLength = l.value"
              class="flex-1 py-2 px-3 rounded-lg border text-sm transition-all"
              :class="settings.defaultLength === l.value ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
            >
              {{ l.label }}
            </button>
          </div>
        </div>

        <button @click="saveDefaultSettings" class="btn-primary w-full">保存默认设置</button>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card">
      <div class="p-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-900">📦 数据管理</h2>
      </div>
      <div class="p-4 space-y-3">
        <button @click="exportData" class="btn-secondary w-full text-sm">
          📤 导出所有数据
        </button>
        <button @click="clearDrafts" class="btn-secondary w-full text-sm text-orange-600 border-orange-200 hover:bg-orange-50">
          🗑️ 清除草稿箱
        </button>
        <button @click="clearAllData" class="btn-secondary w-full text-sm text-red-600 border-red-200 hover:bg-red-50">
          ⚠️ 清除所有数据
        </button>
      </div>
    </div>

    <!-- 关于 -->
    <div class="card p-4">
      <div class="text-center text-xs text-gray-400 space-y-1">
        <p>🔥 头条改写助手 v1.0</p>
        <p>免费·开源·离线可用</p>
        <p>规则改写引擎完全离线运行，无需API Key</p>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="saveMsg" class="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 transition-all">
      ✅ {{ saveMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useSettingsStore, useDraftsStore } from '../stores'
import { aiPlatforms } from '../utils/ai.js'

const settingsStore = useSettingsStore()
const draftsStore = useDraftsStore()
const showApiKey = ref(false)
const saveMsg = ref('')

const settings = reactive({
  aiProvider: settingsStore.aiProvider || 'deepseek',
  apiKey: settingsStore.apiKey || '',
  aiModel: settingsStore.aiModel || 'deepseek-chat',
  aiApiUrl: settingsStore.aiApiUrl || 'https://api.deepseek.com/v1',
  defaultStyle: settingsStore.defaultStyle || 'formal',
  defaultLength: settingsStore.defaultLength || 'medium',
})

const platforms = aiPlatforms

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

const currentPlatformModels = computed(() => {
  const platform = platforms[settings.aiProvider]
  return platform ? platform.models : []
})

function onPlatformChange() {
  const platform = platforms[settings.aiProvider]
  if (platform) {
    if (platform.defaultModel) {
      settings.aiModel = platform.defaultModel
    }
    if (platform.apiUrl) {
      settings.aiApiUrl = platform.apiUrl
    }
  }
}

function saveAIConfig() {
  settingsStore.aiProvider = settings.aiProvider
  settingsStore.apiKey = settings.apiKey
  settingsStore.aiModel = settings.aiModel
  settingsStore.aiApiUrl = settings.aiApiUrl
  settingsStore.save()
  showSaveMsg('AI配置已保存')
}

function saveDefaultSettings() {
  settingsStore.defaultStyle = settings.defaultStyle
  settingsStore.defaultLength = settings.defaultLength
  settingsStore.save()
  showSaveMsg('默认设置已保存')
}

function exportData() {
  const data = settingsStore.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `头条改写助手_数据备份_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showSaveMsg('数据已导出')
}

function clearDrafts() {
  if (confirm('确定要清除所有草稿？此操作不可恢复。')) {
    draftsStore.clearDrafts()
    showSaveMsg('草稿已清除')
  }
}

function clearAllData() {
  if (confirm('确定要清除所有数据？包括设置、草稿、已发布记录，此操作不可恢复。')) {
    settingsStore.clearAllData()
    settings.apiKey = ''
    showSaveMsg('所有数据已清除')
  }
}

function showSaveMsg(msg) {
  saveMsg.value = msg
  setTimeout(() => {
    saveMsg.value = ''
  }, 2000)
}
</script>
