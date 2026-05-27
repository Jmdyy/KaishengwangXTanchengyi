# 三分化训练计划 - 实操手册

凯圣王 × 谭成义 2026 三分化训练计划网页版，离线可用的力量训练实操工具。

基于两位教练的教学视频内容整理而成，将散落在视频中的训练动作、组数次数、递进逻辑全部结构化，支持个性化重量计算和月度递进追踪。

## 功能特性

- **完整训练计划**：Day 1 推日 / Day 2 拉日 / Day 3 腿日，15 个动作全覆盖
- **个性化重量**：输入三大项 1RM，自动推算每个动作的 RPE 8 建议重量
- **月度递进方案**：8 次训练 / 4 周线性递进，自动计算每次训练的推荐重量
- **哑铃/杠铃区分**：哑铃动作标明单手重量，按 2.5kg 步长取整
- **训练记录**：每次训练后可记录实际重量和 RPE，追踪历史
- **完全离线**：数据保存在浏览器 localStorage，不上传任何服务器
- **账号登录**：Node.js 服务端 Session 登录验证

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（无登录验证）
npm run dev

# 构建生产版本
npm run build

# 启动带登录验证的生产服务
AUTH_USER=your_user AUTH_PASS=your_pass npm run serve
```

## 使用方法

1. 首页点击「设置三大项数据」，输入卧推/深蹲/硬拉 1RM
2. 进入训练日查看每个动作的建议重量
3. 点击「月度递进计划」查看 4 周递进表
4. 训练后点「记录本次训练」记录实际数据
5. 每月完成 8 次训练后，重测 1RM 开启新周期

## 部署

```bash
# 构建
npm run build

# 部署 dist/ 目录和 server.mjs 到服务器
# 启动（需 Node.js >= 18）
AUTH_USER=your_user AUTH_PASS=your_pass node server.mjs

# 后台运行
nohup node server.mjs &
```

访问 `http://服务器IP:3000`，输入设置的用户名密码即可登录。

## 技术栈

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 3
- Zustand（状态管理）
- React Router DOM v7

## License

MIT
