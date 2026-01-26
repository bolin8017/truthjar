# Truthjar 設計文件

> 真心話大冒險線上工具，專為聚會設計

## 產品概述

**Truthjar** 是一個真心話大冒險的線上工具，專為聚會場景設計。參與者透過房間代碼或 QR Code 加入同一房間，匿名出題、隨機抽取，讓遊戲更刺激有趣。

### 核心特色

- 房間制，支援 QR Code 快速加入
- 匿名出題，保護出題者身份
- 即時同步，多人連線
- 完全免費

---

## 核心遊戲流程

```
1. 創建/加入房間
   └─ 房主創建房間 → 取得房間代碼 + QR Code
   └─ 其他人輸入代碼或掃 QR Code → 輸入暱稱加入

2. 房主按「開始遊戲」

3. 抽人階段
   └─ 系統從參與者中隨機抽出一人（例如：小明）

4. 選擇階段
   └─ 小明選擇「真心話」或「大冒險」

5. 出題階段
   └─ 其他人針對小明匿名提交題目（可 skip）
   └─ 題目累積到小明的個人題庫（真心話池/大冒險池）
   └─ 若池子為空 → 強制重新出題，至少一人提交

6. 抽題階段
   └─ 小明從自己的題庫中隨機抽一題
   └─ 抽完的題目從池中移除

7. 下一輪
   └─ 小明抽出下一位參與者，回到步驟 3
   └─ 循環直到房主結束或大家離開
```

### 題庫機制

- 每位參與者有兩個獨立的題庫：**真心話池** 和 **大冒險池**
- 題目會跨回合累積，只有被抽中執行的題目才會移除
- 若選擇的類型池子為空，強制重新出題，至少一人提交才能繼續

---

## 技術架構

### 技術棧

| 類別 | 選擇 |
|------|------|
| 前端框架 | React 18 |
| UI 套件 | MUI (Material UI) v5 |
| 路由 | React Router v6 |
| 資料庫 | Firebase Realtime Database |
| 託管 | Firebase Hosting |
| QR Code | qrcode.react |
| 建置工具 | Vite |
| Node 版本管理 | nvm (.nvmrc) |

### 資料結構

```
rooms/
  └─ {roomCode}/                    # 例如 "A3X7K9"
       ├─ hostId: "user123"         # 房主的 ID
       ├─ status: "waiting"         # waiting / playing / ended
       ├─ currentPlayerId: null     # 當前被抽到的人
       ├─ currentPhase: null        # choosing / submitting / drawing
       ├─ currentChoice: null       # truth / dare
       ├─ createdAt: 1234567890
       │
       ├─ players/
       │    ├─ {playerId}/
       │    │    ├─ name: "小明"
       │    │    ├─ joinedAt: 1234567890
       │    │    │
       │    │    ├─ truthPool/      # 真心話池
       │    │    │    ├─ {questionId}/
       │    │    │    │    └─ content: "你最尷尬的經驗是什麼？"
       │    │    │    └─ ...
       │    │    │
       │    │    └─ darePool/       # 大冒險池
       │    │         ├─ {questionId}/
       │    │         │    └─ content: "打電話給最近聯絡人說我愛你"
       │    │         └─ ...
       │    └─ ...
       │
       └─ currentRound/             # 當前回合的暫存資料
            ├─ targetPlayerId: "player1"
            ├─ submittedBy: ["player2", "player3"]
            └─ drawnQuestion: null
```

---

## 頁面與元件架構

### 頁面結構

```
/                     # 首頁 — 創建房間 / 輸入代碼加入
/room/{roomCode}      # 房間頁 — 遊戲主畫面
```

### 房間頁的畫面狀態

| 狀態 | 畫面內容 |
|------|----------|
| **等待中** | 參與者列表、QR Code、房間代碼、房主可見「開始遊戲」按鈕 |
| **抽人中** | 抽獎動畫 → 顯示被抽中的人 |
| **選擇中** | 被抽中的人看到「真心話 / 大冒險」按鈕，其他人等待 |
| **出題中** | 其他人看到出題表單（提交 / Skip），被抽中的人等待 |
| **抽題中** | 被抽中的人按「抽題」，顯示抽中的題目內容 |
| **執行中** | 全員看到題目，被抽中的人有「完成，抽下一位」按鈕 |

### 核心元件

```
src/
├─ pages/
│    ├─ HomePage.jsx          # 首頁
│    └─ RoomPage.jsx          # 房間主頁
│
├─ components/
│    ├─ CreateRoomForm.jsx    # 創建房間表單
│    ├─ JoinRoomForm.jsx      # 加入房間表單
│    ├─ RoomLobby.jsx         # 等待大廳
│    ├─ PlayerDrawing.jsx     # 抽人動畫與結果
│    ├─ ChoiceSelector.jsx    # 真心話/大冒險選擇
│    ├─ QuestionForm.jsx      # 出題表單
│    ├─ QuestionDrawing.jsx   # 抽題動畫與結果
│    └─ PlayerList.jsx        # 參與者列表
│
├─ hooks/
│    ├─ useRoom.js            # 房間資料訂閱與操作
│    └─ usePlayer.js          # 當前玩家狀態
│
├─ services/
│    └─ firebase.js           # Firebase 初始化與工具函數
│
└─ utils/
     └─ roomCode.js           # 房間代碼生成
```

---

## 安全性設計

### Firebase Anonymous Authentication

- 進入網站自動產生匿名 UID
- 不需註冊登入，符合聚會場景
- UID 用於識別玩家身份、防止重複提交

### Security Rules

```javascript
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": "!data.exists()",

        "players": {
          "$playerId": {
            ".write": "auth == null || $playerId == auth.uid"
          }
        },

        "status": {
          ".write": "data.parent().child('hostId').val() == auth.uid"
        }
      }
    }
  }
}
```

### 房間代碼

- 格式：6 位英數字（例如 `A3X7K9`）
- 支援 QR Code 掃描加入

---

## 房主權限

- 刪除房間
- 踢出玩家
- 開始遊戲
- 重置遊戲

---

## 開發規範

### Google Style + 開源風氣

| 項目 | 規範 |
|------|------|
| 程式碼風格 | ESLint + Prettier，遵循 Google JavaScript Style Guide |
| 命名 | 元件 PascalCase、函數/變數 camelCase、常數 UPPER_SNAKE_CASE |
| 提交訊息 | Conventional Commits（feat:、fix:、docs: 等） |
| 分支策略 | main 為穩定版，feature/* 開發功能 |
| 文件 | README 包含安裝步驟、使用說明、貢獻指南 |
| 授權 | MIT License |

---

## 專案結構

```
truthjar/
├─ public/
│    └─ favicon.ico
│
├─ src/
│    ├─ pages/
│    ├─ components/
│    ├─ hooks/
│    ├─ services/
│    ├─ utils/
│    ├─ App.jsx
│    ├─ main.jsx
│    └─ theme.js
│
├─ .nvmrc                     # Node 版本
├─ .gitignore
├─ .eslintrc.cjs
├─ index.html
├─ package.json
├─ vite.config.js
├─ firebase.json
├─ .firebaserc
├─ database.rules.json
├─ README.md
└─ LICENSE
```

---

## 資料清理策略

- 房主手動刪除房間
- 可選：Firebase Cloud Functions 設定 7 天未活動自動清理
