import { createPinia } from 'pinia'

// 从localStorage加载/保存的通用方法
function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('保存到localStorage失败:', e)
  }
}

export const pinia = createPinia()

// ==================== 设置 Store ====================
export function useSettingsStore() {
  const state = {
    // AI配置
    aiProvider: loadFromStorage('settings_aiProvider', 'deepseek'),
    apiKey: loadFromStorage('settings_apiKey', ''),
    aiModel: loadFromStorage('settings_aiModel', 'deepseek-chat'),
    aiApiUrl: loadFromStorage('settings_aiApiUrl', 'https://api.deepseek.com/v1'),

    // 默认改写设置
    defaultStyle: loadFromStorage('settings_defaultStyle', 'formal'),
    defaultLength: loadFromStorage('settings_defaultLength', 'medium'),

    // 统计
    ruleRewriteCount: loadFromStorage('settings_ruleRewriteCount', 0),
    aiRewriteCount: loadFromStorage('settings_aiRewriteCount', 0),
  }

  return {
    ...state,
    save() {
      saveToStorage('settings_aiProvider', state.aiProvider)
      saveToStorage('settings_apiKey', state.apiKey)
      saveToStorage('settings_aiModel', state.aiModel)
      saveToStorage('settings_aiApiUrl', state.aiApiUrl)
      saveToStorage('settings_defaultStyle', state.defaultStyle)
      saveToStorage('settings_defaultLength', state.defaultLength)
      saveToStorage('settings_ruleRewriteCount', state.ruleRewriteCount)
      saveToStorage('settings_aiRewriteCount', state.aiRewriteCount)
    },
    incrementRuleRewrite() {
      state.ruleRewriteCount++
      saveToStorage('settings_ruleRewriteCount', state.ruleRewriteCount)
    },
    incrementAiRewrite() {
      state.aiRewriteCount++
      saveToStorage('settings_aiRewriteCount', state.aiRewriteCount)
    },
    clearAllData() {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('settings_') || k.startsWith('drafts_') || k.startsWith('published_'))
      keys.forEach(k => localStorage.removeItem(k))
      state.ruleRewriteCount = 0
      state.aiRewriteCount = 0
      state.apiKey = ''
    },
    exportData() {
      const data = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key.startsWith('settings_') || key.startsWith('drafts_') || key.startsWith('published_')) {
          data[key] = localStorage.getItem(key)
        }
      }
      return JSON.stringify(data, null, 2)
    }
  }
}

// ==================== 草稿 Store ====================
export function useDraftsStore() {
  function getDrafts() {
    return loadFromStorage('drafts_list', [])
  }

  function getPublished() {
    return loadFromStorage('published_list', [])
  }

  return {
    getDrafts,
    getPublished,

    saveDraft(draft) {
      const drafts = getDrafts()
      const existing = drafts.findIndex(d => d.id === draft.id)
      const draftData = {
        ...draft,
        updatedAt: new Date().toISOString()
      }
      if (existing >= 0) {
        drafts[existing] = draftData
      } else {
        draftData.id = draft.id || Date.now().toString()
        draftData.createdAt = new Date().toISOString()
        drafts.unshift(draftData)
      }
      saveToStorage('drafts_list', drafts)
      return draftData
    },

    deleteDraft(id) {
      const drafts = getDrafts().filter(d => d.id !== id)
      saveToStorage('drafts_list', drafts)
    },

    getDraft(id) {
      return getDrafts().find(d => d.id === id) || null
    },

    markAsPublished(draft) {
      const published = getPublished()
      published.unshift({
        ...draft,
        publishedAt: new Date().toISOString()
      })
      saveToStorage('published_list', published)
      // 从草稿中移除
      this.deleteDraft(draft.id)
    },

    deletePublished(id) {
      const published = getPublished().filter(d => d.id !== id)
      saveToStorage('published_list', published)
    },

    clearDrafts() {
      saveToStorage('drafts_list', [])
    },

    clearPublished() {
      saveToStorage('published_list', [])
    }
  }
}

// ==================== 当前工作状态 Store ====================
let _currentArticle = loadFromStorage('current_article', null)

export function useCurrentArticleStore() {
  return {
    get current() { return _currentArticle },
    set(article) {
      _currentArticle = article
      saveToStorage('current_article', article)
    },
    clear() {
      _currentArticle = null
      localStorage.removeItem('current_article')
    }
  }
}
