<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 桌面端顶部导航 -->
    <header class="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🔥</span>
          <span class="font-bold text-lg text-gray-900">头条改写助手</span>
        </div>
        <nav class="flex items-center space-x-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.path) ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-100'"
          >
            {{ item.icon }} {{ item.label }}
          </router-link>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 pb-16 md:pb-0">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div class="flex items-center justify-around h-14">
        <router-link
          v-for="item in mobileNavItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center space-y-0.5 flex-1 h-full transition-colors"
          :class="isActive(item.path) ? 'text-primary-400' : 'text-gray-400'"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span class="text-xs">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', label: '热点发现', icon: '🔥' },
  { path: '/rewrite', label: '改写工作台', icon: '✍️' },
  { path: '/editor', label: '编辑器', icon: '📝' },
  { path: '/my', label: '我的', icon: '📁' },
  { path: '/settings', label: '设置', icon: '⚙️' },
]

const mobileNavItems = [
  { path: '/', label: '热点', icon: '🔥' },
  { path: '/rewrite', label: '改写', icon: '✍️' },
  { path: '/my', label: '我的', icon: '📁' },
  { path: '/settings', label: '设置', icon: '⚙️' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
