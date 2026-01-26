# Truthjar

免費線上真心話大冒險遊戲，專為聚會設計。

## 功能特色

- **房間制** - 創建房間，分享代碼或 QR Code 讓朋友加入
- **匿名出題** - 出題者身份保密，讓遊戲更刺激
- **隨機抽取** - 隨機抽人、隨機抽題，命運由天決定
- **即時同步** - 多人連線，畫面即時更新
- **完全免費** - 無廣告、無付費牆

## 遊戲流程

1. 房主創建房間，分享房間代碼或 QR Code
2. 玩家輸入代碼或掃描 QR Code 加入
3. 房主按下「開始遊戲」
4. 系統隨機抽出一位玩家
5. 被抽中的人選擇「真心話」或「大冒險」
6. 其他玩家匿名出題（題目會累積到個人題庫）
7. 被抽中的人從題庫抽一題執行
8. 完成後抽下一位，循環遊戲

## 本地開發

### 前置需求

- Node.js 20+（建議使用 nvm）
- Firebase 帳號

### 安裝步驟

1. Clone 專案

```bash
git clone https://github.com/your-username/truthjar.git
cd truthjar
```

2. 使用正確的 Node 版本

```bash
nvm use
```

3. 安裝依賴

```bash
npm install
```

4. 設定 Firebase

- 在 [Firebase Console](https://console.firebase.google.com/) 創建專案
- 啟用 Anonymous Authentication
- 創建 Realtime Database
- 複製專案設定

5. 創建環境變數檔案

```bash
cp .env.example .env.local
```

填入你的 Firebase 設定值。

6. 啟動開發伺服器

```bash
npm run dev
```

### 部署

```bash
npm run build
firebase deploy
```

## 技術棧

- **前端**: React 18, MUI v5, React Router v6
- **後端**: Firebase (Auth + Realtime Database + Hosting)
- **建置**: Vite
- **程式碼風格**: ESLint + Prettier

## 貢獻指南

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### Commit 訊息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` 新功能
- `fix:` 修復 bug
- `docs:` 文件更新
- `style:` 程式碼風格（不影響功能）
- `refactor:` 重構
- `test:` 測試相關
- `chore:` 其他雜項

## 授權

MIT License - 詳見 [LICENSE](LICENSE)
