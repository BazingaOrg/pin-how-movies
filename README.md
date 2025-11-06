# Pin How Movies

完全复刻 CodePen 动画搜索框的电影搜索应用。

## 🎨 设计参考

- **CodePen**: [Animated Search Box](https://codepen.io/AlbertFeynman/pen/BPvzWZ)
  - 作者: AlbertFeynman
  - 描述: 搜索框的视觉设计和动画效果参考来源
  - 使用: 搜索框的整体样式、圆角设计、阴影效果和悬停动画

- **CodePen**: [Background Design](https://codepen.io/agoodwin/pen/NMJoER)
  - 作者: agoodwin
  - 描述: 页面背景的视觉设计和动画效果参考来源
  - 使用: 星空背景、云层动画和月亮效果

- **CodePen**: [Movie Cards](https://codepen.io/simoberny/pen/qxxOqj)
  - 作者: simoberny
  - 描述: 电影卡片的布局设计和样式参考来源
  - 使用: 电影卡片的网格布局、卡片样式和悬停效果

- **美团拼好饭**
  - 描述: 整体灵感来源，强调轻量快捷的点餐体验
  - 使用: 将「拼好饭」的流畅体验转化为电影搜索的交互节奏和氛围

## 🚀 技术栈

Next.js 14 + TypeScript + Tailwind CSS + TMDB API

## ✨ 功能特点

- 🎬 电影搜索：支持名称、演员、导演模糊搜索
- 🎨 动画设计：100% 复刻 CodePen 动画搜索框
- 📱 响应式：支持移动端和桌面端
- 🌙 深色模式：自动适配系统主题

## 🏃‍♂️ 快速开始

1. **配置 TMDB API**:
```bash
# 创建 .env.local 文件
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

2. **安装运行**:
```bash
npm install
npm run dev
```

访问 http://localhost:3000 查看应用。
