# 🔥 头条改写助手

免费的全网爆款新闻搜索、改写、配图Web应用，用于生成头条号发布内容。

## ✨ 核心特性

- **🆓 完全免费**：内置规则改写引擎，离线即可使用，无需任何API Key
- **🤖 AI增强**：支持接入豆包/通义千问/DeepSeek/百度文心等AI模型，高质量改写
- **🔥 热点发现**：自动抓取微博热搜、体育热点，一键改写
- **✍️ 智能改写**：同义词替换+句子重组+段落重排+过渡词添加，多风格多长度
- **🖼️ 自动配图**：一键搜索配图，支持Unsplash/Pexels
- **📱 响应式设计**：手机电脑都能用，移动端底部Tab + 桌面端顶部导航
- **☁️ 免费部署**：一键部署到Vercel，零成本运行

## 📁 项目结构

```
├── api/                      # Vercel Serverless Functions
│   ├── hotnews.js           # 热点新闻抓取
│   ├── article.js           # 文章原文获取
│   ├── proxy-ai.js          # AI接口代理（解决跨域）
│   └── images.js            # 图片搜索代理
├── src/
│   ├── main.js              # 入口文件
│   ├── App.vue              # 根组件
│   ├── style.css            # 全局样式（TailwindCSS）
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── stores/
│   │   └── index.js         # 状态管理（localStorage）
│   ├── utils/
│   │   ├── synonyms.js      # 同义词库（200+词对）
│   │   ├── rewriter.js      # 规则改写引擎
│   │   └── ai.js            # AI改写模块
│   └── views/
│       ├── HotNews.vue      # 热点发现页
│       ├── Rewrite.vue      # 改写工作台
│       ├── Editor.vue       # 文章编辑器
│       ├── Preview.vue      # 文章预览
│       ├── MyPage.vue       # 我的（草稿箱+已发布）
│       └── Settings.vue     # 设置页
├── index.html               # HTML入口
├── package.json             # 依赖配置
├── vite.config.js           # Vite配置
├── tailwind.config.js       # TailwindCSS配置
├── postcss.config.js        # PostCSS配置
├── vercel.json              # Vercel部署配置
├── .env.example             # 环境变量示例
└── README.md                # 项目文档
```

## 🚀 本地运行

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
cd 新闻改写Web应用
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可使用。

> 注意：本地开发时，API代理需要Vercel CLI。可以先使用内置的模拟数据体验完整功能。

### 本地运行API（可选）

如需本地测试Serverless Functions：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 本地运行
vercel dev
```

## ☁️ Vercel部署

### 方式一：一键部署

1. Fork本项目到你的GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project" → 导入你的GitHub仓库
4. 保持默认配置，点击 "Deploy"
5. 部署完成后访问Vercel分配的域名即可

### 方式二：CLI部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目根目录执行
vercel

# 按提示操作，首次需要登录
# 部署完成后会获得访问地址
```

### 配置环境变量（可选）

在Vercel项目设置中添加以下环境变量（不配置则使用模拟数据）：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_UNSPLASH_ACCESS_KEY` | Unsplash图片搜索API Key | （到unsplash.com申请） |
| `PEXELS_API_KEY` | Pexels图片搜索API Key | （到pexels.com/api申请） |

> AI API Key 在网页端设置页面配置，存储在浏览器localStorage中，不会上传到服务器。

## 📖 使用说明

### 1. 发现热点
- 打开应用首页，浏览综合热点或体育热点
- 使用搜索框搜索感兴趣的话题
- 点击"改写此文"进入改写工作台

### 2. 改写文章
- 选择改写模式：
  - **规则改写（免费）**：内置引擎，同义词替换+句子重组+段落重排，完全离线
  - **AI改写**：接入AI模型，生成更高质量的改写内容
- 选择改写风格：正式/口语化/深度分析/犀利评论
- 选择文章长度：短文500字/中文1000字/长文1500字
- 开关：添加开头引导语、添加个人观点
- 点击"开始改写"

### 3. 编辑文章
- 修改标题和正文
- 一键搜索配图
- 保存草稿

### 4. 预览与发布
- 预览头条号文章效果
- 复制标题/正文/全文（Markdown格式）
- 标记为已发布

### 5. AI配置
- 进入设置页面
- 选择AI平台（豆包/通义千问/DeepSeek/文心/自定义）
- 输入API Key
- 选择模型
- 保存配置

## 🧠 规则改写引擎原理

规则改写引擎是完全免费离线的核心功能，主要策略：

1. **同义词替换**：内置200+中文常用同义词对，概率性替换原文词汇
2. **句式变换**：主动句↔被动句、肯定句↔双重否定、长句拆分、短句合并
3. **段落重组**：打乱段落和句子顺序（保持首尾不变），添加过渡词连接
4. **开头引导语**：根据文章主题生成吸引人的开头段落
5. **个人观点**：在关键位置插入评论性语句
6. **标题改写**：疑问式、感叹式、数字式、对比式多种模板

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 | 前端框架 |
| Vue Router | 路由管理 |
| Pinia | 状态管理 |
| Vite | 构建工具 |
| TailwindCSS | 样式框架 |
| Vercel Serverless Functions | 后端API |
| localStorage | 本地存储 |

## 📄 License

MIT License - 自由使用、修改、分发
