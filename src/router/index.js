import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'HotNews',
    component: () => import('../views/HotNews.vue'),
    meta: { title: '热点发现', icon: '🔥' }
  },
  {
    path: '/rewrite',
    name: 'Rewrite',
    component: () => import('../views/Rewrite.vue'),
    meta: { title: '改写工作台', icon: '✍️' }
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('../views/Editor.vue'),
    meta: { title: '文章编辑器', icon: '📝' }
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('../views/Preview.vue'),
    meta: { title: '文章预览', icon: '👁️' }
  },
  {
    path: '/my',
    name: 'MyPage',
    component: () => import('../views/MyPage.vue'),
    meta: { title: '我的', icon: '📁' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '设置', icon: '⚙️' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '头条改写助手'} - 头条改写助手`
  next()
})

export default router
