# Crazy Ones - 小季家疯狂 1 点

一个基于 React + Vite + Tailwind CSS 开发的扑克牌游戏。

## 部署到 Vercel 指南

### 第一步：同步到 GitHub
1. 在 GitHub 上创建一个新的仓库。
2. 在本地终端运行以下命令（如果你在本地环境）：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <你的仓库URL>
   git push -u origin main
   ```

### 第二步：在 Vercel 上部署
1. 登录 [Vercel](https://vercel.com/)。
2. 点击 **"Add New"** -> **"Project"**。
3. 导入你刚才创建的 GitHub 仓库。
4. Vercel 会自动识别这是一个 Vite 项目。
5. **环境变量配置**：
   - 如果你使用了 Gemini API 功能，请在 Vercel 的项目设置中添加 `GEMINI_API_KEY` 环境变量。
6. 点击 **"Deploy"**。

### 项目结构
- `src/App.tsx`: 核心游戏逻辑（使用 useReducer 保证状态原子性）。
- `src/components/Card.tsx`: 纸牌组件。
- `src/utils/gameLogic.ts`: 游戏规则与 AI 逻辑。
