# Truthjar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real-time truth-or-dare party game web app with room-based gameplay, anonymous question submission, and Firebase backend.

**Architecture:** Single-page React app with Firebase Realtime Database for real-time sync. No custom backend needed - Firebase handles auth, data, and hosting. State managed via React hooks subscribing to Firebase paths.

**Tech Stack:** React 18, Vite, MUI v5, React Router v6, Firebase (Auth + Realtime DB + Hosting), qrcode.react

---

## Task 1: Project Initialization

**Files:**
- Create: `.nvmrc`
- Create: `package.json` (via vite)
- Create: `vite.config.js` (via vite)
- Create: `.gitignore`
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `LICENSE`

**Step 1: Create .nvmrc**

```bash
echo "20" > .nvmrc
```

**Step 2: Initialize Vite project**

```bash
nvm use
npm create vite@latest . -- --template react
```

Select: Overwrite existing files when prompted.

**Step 3: Install dependencies**

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled react-router-dom firebase qrcode.react
```

**Step 4: Install dev dependencies**

```bash
npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier
```

**Step 5: Create .eslintrc.cjs**

Create file `.eslintrc.cjs`:

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
```

**Step 6: Create .prettierrc**

Create file `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Step 7: Update .gitignore**

Replace `.gitignore` content:

```
# Dependencies
node_modules/

# Build
dist/

# Environment
.env
.env.local
.env.*.local

# Firebase
.firebase/

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

**Step 8: Create LICENSE**

Create file `LICENSE`:

```
MIT License

Copyright (c) 2026 Truthjar Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Step 9: Verify setup**

```bash
npm run dev
```

Expected: Vite dev server starts, default React page loads at http://localhost:5173

**Step 10: Commit**

```bash
git add -A
git commit -m "chore: initialize Vite + React project with ESLint and Prettier"
```

---

## Task 2: Firebase Setup

**Files:**
- Create: `src/services/firebase.js`
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `database.rules.json`
- Create: `.env.example`

**Step 1: Create Firebase project**

1. Go to https://console.firebase.google.com/
2. Create new project named "truthjar"
3. Enable Authentication > Anonymous sign-in
4. Create Realtime Database (start in test mode, we'll add rules later)
5. Go to Project Settings > General > Your apps > Add web app
6. Copy the config object

**Step 2: Create .env.example**

Create file `.env.example`:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Step 3: Create .env.local with actual values**

Create file `.env.local` (DO NOT COMMIT):

```
VITE_FIREBASE_API_KEY=<actual-value>
VITE_FIREBASE_AUTH_DOMAIN=<actual-value>
VITE_FIREBASE_DATABASE_URL=<actual-value>
VITE_FIREBASE_PROJECT_ID=<actual-value>
VITE_FIREBASE_STORAGE_BUCKET=<actual-value>
VITE_FIREBASE_MESSAGING_SENDER_ID=<actual-value>
VITE_FIREBASE_APP_ID=<actual-value>
```

**Step 4: Create src/services/firebase.js**

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const signInAnonymouslyIfNeeded = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then(resolve).catch(reject);
      }
    });
  });
};

export const getCurrentUserId = () => {
  return auth.currentUser?.uid || null;
};
```

**Step 5: Create database.rules.json**

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": "!data.exists() || data.child('hostId').val() == auth.uid",

        "players": {
          "$playerId": {
            ".write": "$playerId == auth.uid || data.parent().parent().child('hostId').val() == auth.uid"
          }
        },

        "currentRound": {
          ".write": "data.parent().child('players').child(auth.uid).exists()"
        }
      }
    }
  }
}
```

**Step 6: Install Firebase CLI and login**

```bash
npm install -g firebase-tools
firebase login
```

**Step 7: Initialize Firebase in project**

```bash
firebase init
```

Select:
- Realtime Database (use database.rules.json)
- Hosting (use dist as public directory, configure as SPA)

**Step 8: Create firebase.json** (if not created by init)

```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Step 9: Deploy database rules**

```bash
firebase deploy --only database
```

**Step 10: Commit**

```bash
git add .env.example src/services/firebase.js database.rules.json firebase.json .firebaserc
git commit -m "feat: add Firebase configuration and security rules"
```

---

## Task 3: MUI Theme and App Shell

**Files:**
- Create: `src/theme.js`
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Create: `src/pages/HomePage.jsx`
- Create: `src/pages/RoomPage.jsx`
- Delete: `src/App.css`
- Delete: `src/index.css`

**Step 1: Create src/theme.js**

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
    },
    secondary: {
      main: '#ec4899', // Pink
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

export default theme;
```

**Step 2: Create src/pages/HomePage.jsx**

```javascript
import { Box, Typography } from '@mui/material';

function HomePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Truthjar
      </Typography>
      <Typography color="text.secondary">
        真心話大冒險
      </Typography>
    </Box>
  );
}

export default HomePage;
```

**Step 3: Create src/pages/RoomPage.jsx**

```javascript
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function RoomPage() {
  const { roomCode } = useParams();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Typography variant="h5">
        房間: {roomCode}
      </Typography>
    </Box>
  );
}

export default RoomPage;
```

**Step 4: Update src/main.jsx**

```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import theme from './theme.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

**Step 5: Update src/App.jsx**

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomCode" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Step 6: Delete unused CSS files**

```bash
rm src/App.css src/index.css
```

**Step 7: Verify routing**

```bash
npm run dev
```

Expected:
- http://localhost:5173/ shows "Truthjar 真心話大冒險"
- http://localhost:5173/room/ABC123 shows "房間: ABC123"

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add MUI theme and routing structure"
```

---

## Task 4: Room Code Utility

**Files:**
- Create: `src/utils/roomCode.js`

**Step 1: Create src/utils/roomCode.js**

```javascript
const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}

export function isValidRoomCode(code) {
  if (!code || typeof code !== 'string') return false;
  if (code.length !== CODE_LENGTH) return false;
  return code.split('').every((char) => CHARACTERS.includes(char));
}
```

**Step 2: Verify in browser console**

Open browser console and test:

```javascript
import('/src/utils/roomCode.js').then(m => {
  console.log(m.generateRoomCode());
  console.log(m.isValidRoomCode('A3X7K9'));
  console.log(m.isValidRoomCode('invalid'));
});
```

Expected: Random 6-char code, true, false

**Step 3: Commit**

```bash
git add src/utils/roomCode.js
git commit -m "feat: add room code generation utility"
```

---

## Task 5: Firebase Room Service

**Files:**
- Create: `src/services/roomService.js`

**Step 1: Create src/services/roomService.js**

```javascript
import { ref, set, get, update, remove, push, onValue, off } from 'firebase/database';
import { db, getCurrentUserId } from './firebase';
import { generateRoomCode } from '../utils/roomCode';

export async function createRoom(hostName) {
  const hostId = getCurrentUserId();
  if (!hostId) throw new Error('Not authenticated');

  let roomCode = generateRoomCode();
  let attempts = 0;

  // Ensure unique room code
  while (attempts < 10) {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const roomData = {
    hostId,
    status: 'waiting',
    currentPlayerId: null,
    currentPhase: null,
    currentChoice: null,
    createdAt: Date.now(),
    players: {
      [hostId]: {
        name: hostName,
        joinedAt: Date.now(),
      },
    },
  };

  await set(ref(db, `rooms/${roomCode}`), roomData);
  return roomCode;
}

export async function joinRoom(roomCode, playerName) {
  const playerId = getCurrentUserId();
  if (!playerId) throw new Error('Not authenticated');

  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('房間不存在');
  }

  const room = snapshot.val();
  if (room.status !== 'waiting') {
    throw new Error('遊戲已開始，無法加入');
  }

  await set(ref(db, `rooms/${roomCode}/players/${playerId}`), {
    name: playerName,
    joinedAt: Date.now(),
  });

  return room;
}

export async function getRoomOnce(roomCode) {
  const snapshot = await get(ref(db, `rooms/${roomCode}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export function subscribeToRoom(roomCode, callback) {
  const roomRef = ref(db, `rooms/${roomCode}`);
  onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return () => off(roomRef);
}

export async function startGame(roomCode) {
  const userId = getCurrentUserId();
  const room = await getRoomOnce(roomCode);

  if (!room) throw new Error('房間不存在');
  if (room.hostId !== userId) throw new Error('只有房主可以開始遊戲');

  const playerIds = Object.keys(room.players || {});
  if (playerIds.length < 2) throw new Error('至少需要 2 位玩家');

  await update(ref(db, `rooms/${roomCode}`), {
    status: 'playing',
    currentPhase: 'drawing',
  });
}

export async function drawPlayer(roomCode) {
  const room = await getRoomOnce(roomCode);
  if (!room) throw new Error('房間不存在');

  const playerIds = Object.keys(room.players || {});
  const randomIndex = Math.floor(Math.random() * playerIds.length);
  const selectedPlayerId = playerIds[randomIndex];

  await update(ref(db, `rooms/${roomCode}`), {
    currentPlayerId: selectedPlayerId,
    currentPhase: 'choosing',
    currentChoice: null,
    currentRound: {
      targetPlayerId: selectedPlayerId,
      submittedBy: {},
      drawnQuestion: null,
    },
  });

  return selectedPlayerId;
}

export async function makeChoice(roomCode, choice) {
  if (choice !== 'truth' && choice !== 'dare') {
    throw new Error('Invalid choice');
  }

  await update(ref(db, `rooms/${roomCode}`), {
    currentChoice: choice,
    currentPhase: 'submitting',
  });
}

export async function submitQuestion(roomCode, content) {
  const userId = getCurrentUserId();
  const room = await getRoomOnce(roomCode);

  if (!room) throw new Error('房間不存在');

  const targetPlayerId = room.currentRound?.targetPlayerId;
  const poolType = room.currentChoice === 'truth' ? 'truthPool' : 'darePool';

  // Add question to target player's pool
  const questionRef = push(ref(db, `rooms/${roomCode}/players/${targetPlayerId}/${poolType}`));
  await set(questionRef, { content });

  // Mark as submitted
  await set(ref(db, `rooms/${roomCode}/currentRound/submittedBy/${userId}`), true);
}

export async function skipQuestion(roomCode) {
  const userId = getCurrentUserId();
  await set(ref(db, `rooms/${roomCode}/currentRound/submittedBy/${userId}`), true);
}

export async function checkAllSubmitted(roomCode) {
  const room = await getRoomOnce(roomCode);
  if (!room) return false;

  const playerIds = Object.keys(room.players || {});
  const targetPlayerId = room.currentRound?.targetPlayerId;
  const submittedBy = Object.keys(room.currentRound?.submittedBy || {});

  // All players except target should have submitted/skipped
  const otherPlayers = playerIds.filter((id) => id !== targetPlayerId);
  return otherPlayers.every((id) => submittedBy.includes(id));
}

export async function getPoolCount(roomCode, playerId, poolType) {
  const snapshot = await get(ref(db, `rooms/${roomCode}/players/${playerId}/${poolType}`));
  if (!snapshot.exists()) return 0;
  return Object.keys(snapshot.val()).length;
}

export async function proceedToDrawQuestion(roomCode) {
  await update(ref(db, `rooms/${roomCode}`), {
    currentPhase: 'drawingQuestion',
  });
}

export async function drawQuestion(roomCode) {
  const room = await getRoomOnce(roomCode);
  if (!room) throw new Error('房間不存在');

  const targetPlayerId = room.currentPlayerId;
  const poolType = room.currentChoice === 'truth' ? 'truthPool' : 'darePool';
  const poolRef = ref(db, `rooms/${roomCode}/players/${targetPlayerId}/${poolType}`);

  const snapshot = await get(poolRef);
  if (!snapshot.exists()) throw new Error('題庫是空的');

  const questions = snapshot.val();
  const questionIds = Object.keys(questions);
  const randomIndex = Math.floor(Math.random() * questionIds.length);
  const selectedId = questionIds[randomIndex];
  const selectedQuestion = questions[selectedId];

  // Remove from pool
  await remove(ref(db, `rooms/${roomCode}/players/${targetPlayerId}/${poolType}/${selectedId}`));

  // Set as drawn question
  await update(ref(db, `rooms/${roomCode}`), {
    currentPhase: 'executing',
    'currentRound/drawnQuestion': selectedQuestion.content,
  });

  return selectedQuestion.content;
}

export async function finishRound(roomCode) {
  await update(ref(db, `rooms/${roomCode}`), {
    currentPhase: 'drawing',
    currentPlayerId: null,
    currentChoice: null,
    currentRound: null,
  });
}

export async function kickPlayer(roomCode, playerId) {
  const userId = getCurrentUserId();
  const room = await getRoomOnce(roomCode);

  if (!room) throw new Error('房間不存在');
  if (room.hostId !== userId) throw new Error('只有房主可以踢人');
  if (playerId === room.hostId) throw new Error('不能踢出房主');

  await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
}

export async function deleteRoom(roomCode) {
  const userId = getCurrentUserId();
  const room = await getRoomOnce(roomCode);

  if (!room) throw new Error('房間不存在');
  if (room.hostId !== userId) throw new Error('只有房主可以刪除房間');

  await remove(ref(db, `rooms/${roomCode}`));
}

export async function resetGame(roomCode) {
  const userId = getCurrentUserId();
  const room = await getRoomOnce(roomCode);

  if (!room) throw new Error('房間不存在');
  if (room.hostId !== userId) throw new Error('只有房主可以重置遊戲');

  // Clear all players' pools and reset game state
  const updates = {
    status: 'waiting',
    currentPlayerId: null,
    currentPhase: null,
    currentChoice: null,
    currentRound: null,
  };

  // Clear pools for each player
  const playerIds = Object.keys(room.players || {});
  for (const pid of playerIds) {
    updates[`players/${pid}/truthPool`] = null;
    updates[`players/${pid}/darePool`] = null;
  }

  await update(ref(db, `rooms/${roomCode}`), updates);
}
```

**Step 2: Commit**

```bash
git add src/services/roomService.js
git commit -m "feat: add room service with all game operations"
```

---

## Task 6: Custom Hooks

**Files:**
- Create: `src/hooks/useAuth.js`
- Create: `src/hooks/useRoom.js`

**Step 1: Create src/hooks/useAuth.js**

```javascript
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnonymouslyIfNeeded } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Ensure anonymous sign-in
    signInAnonymouslyIfNeeded();

    return unsubscribe;
  }, []);

  return { user, loading, userId: user?.uid || null };
}
```

**Step 2: Create src/hooks/useRoom.js**

```javascript
import { useState, useEffect } from 'react';
import { subscribeToRoom } from '../services/roomService';

export function useRoom(roomCode) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
      if (roomData) {
        setRoom(roomData);
        setError(null);
      } else {
        setRoom(null);
        setError('房間不存在');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [roomCode]);

  return { room, loading, error };
}
```

**Step 3: Commit**

```bash
git add src/hooks/useAuth.js src/hooks/useRoom.js
git commit -m "feat: add useAuth and useRoom hooks"
```

---

## Task 7: HomePage Components

**Files:**
- Create: `src/components/CreateRoomForm.jsx`
- Create: `src/components/JoinRoomForm.jsx`
- Modify: `src/pages/HomePage.jsx`

**Step 1: Create src/components/CreateRoomForm.jsx**

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { createRoom } from '../services/roomService';

function CreateRoomForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請輸入暱稱');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const roomCode = await createRoom(name.trim());
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          創建房間
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="你的暱稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : '創建房間'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CreateRoomForm;
```

**Step 2: Create src/components/JoinRoomForm.jsx**

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { joinRoom } from '../services/roomService';
import { isValidRoomCode } from '../utils/roomCode';

function JoinRoomForm() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請輸入暱稱');
      return;
    }

    const code = roomCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) {
      setError('房間代碼格式不正確');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinRoom(code, name.trim());
      navigate(`/room/${code}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          加入房間
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="你的暱稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="房間代碼"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            disabled={loading}
            placeholder="例如: A3X7K9"
            inputProps={{ maxLength: 6 }}
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : '加入房間'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default JoinRoomForm;
```

**Step 3: Update src/pages/HomePage.jsx**

```javascript
import { Box, Typography, Divider, CircularProgress } from '@mui/material';
import CreateRoomForm from '../components/CreateRoomForm';
import JoinRoomForm from '../components/JoinRoomForm';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        gap: 3,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          🫙 Truthjar
        </Typography>
        <Typography color="text.secondary">
          真心話大冒險
        </Typography>
      </Box>

      <CreateRoomForm />

      <Divider sx={{ width: '100%', maxWidth: 400 }}>或</Divider>

      <JoinRoomForm />
    </Box>
  );
}

export default HomePage;
```

**Step 4: Verify**

```bash
npm run dev
```

Expected: HomePage shows create and join forms with styled cards.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add HomePage with create and join room forms"
```

---

## Task 8: Room Lobby

**Files:**
- Create: `src/components/RoomLobby.jsx`
- Create: `src/components/PlayerList.jsx`

**Step 1: Create src/components/PlayerList.jsx**

```javascript
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';

function PlayerList({ players, hostId, currentUserId, onKick, showKick = false }) {
  const playerEntries = Object.entries(players || {});

  return (
    <List>
      {playerEntries.map(([playerId, player]) => (
        <ListItem key={playerId}>
          <ListItemIcon>
            {playerId === hostId ? (
              <StarIcon color="primary" />
            ) : (
              <PersonIcon />
            )}
          </ListItemIcon>
          <ListItemText
            primary={player.name}
            secondary={playerId === currentUserId ? '(你)' : null}
          />
          {playerId === hostId && (
            <Chip label="房主" size="small" color="primary" variant="outlined" />
          )}
          {showKick && playerId !== hostId && playerId !== currentUserId && (
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => onKick(playerId)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}

export default PlayerList;
```

**Step 2: Create src/components/RoomLobby.jsx**

```javascript
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import PlayerList from './PlayerList';
import { startGame, kickPlayer, deleteRoom } from '../services/roomService';

function RoomLobby({ room, roomCode, userId }) {
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isHost = room.hostId === userId;
  const playerCount = Object.keys(room.players || {}).length;
  const roomUrl = `${window.location.origin}/room/${roomCode}`;

  const handleStartGame = async () => {
    try {
      setError('');
      await startGame(roomCode);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKick = async (playerId) => {
    try {
      await kickPlayer(roomCode, playerId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await deleteRoom(roomCode);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            房間代碼
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontFamily: 'monospace', letterSpacing: 4, mb: 2 }}
          >
            {roomCode}
          </Typography>
          <QRCodeSVG value={roomUrl} size={180} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            掃描 QR Code 或輸入代碼加入
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            玩家 ({playerCount})
          </Typography>
          <PlayerList
            players={room.players}
            hostId={room.hostId}
            currentUserId={userId}
            showKick={isHost}
            onKick={handleKick}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isHost && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleStartGame}
            disabled={playerCount < 2}
          >
            {playerCount < 2 ? '至少需要 2 位玩家' : '開始遊戲'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => setDeleteDialogOpen(true)}
          >
            刪除房間
          </Button>
        </Box>
      )}

      {!isHost && (
        <Alert severity="info">等待房主開始遊戲...</Alert>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>確定要刪除房間嗎？</DialogTitle>
        <DialogContent>
          所有玩家將被踢出，遊戲資料將被清除。
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeleteRoom} color="error">
            確定刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RoomLobby;
```

**Step 3: Commit**

```bash
git add src/components/PlayerList.jsx src/components/RoomLobby.jsx
git commit -m "feat: add RoomLobby with QR code and player list"
```

---

## Task 9: Game Phase Components

**Files:**
- Create: `src/components/PlayerDrawing.jsx`
- Create: `src/components/ChoiceSelector.jsx`
- Create: `src/components/QuestionForm.jsx`
- Create: `src/components/QuestionDrawing.jsx`

**Step 1: Create src/components/PlayerDrawing.jsx**

```javascript
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { drawPlayer } from '../services/roomService';

function PlayerDrawing({ room, roomCode, userId }) {
  const [drawing, setDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const currentPlayer = room.currentPlayerId
    ? room.players[room.currentPlayerId]
    : null;

  const handleDraw = async () => {
    setDrawing(true);
    try {
      await drawPlayer(roomCode);
      setShowResult(true);
    } catch (err) {
      console.error(err);
    }
    setDrawing(false);
  };

  // Reset when phase changes back to drawing
  useEffect(() => {
    if (room.currentPhase === 'drawing' && !room.currentPlayerId) {
      setShowResult(false);
    }
  }, [room.currentPhase, room.currentPlayerId]);

  if (showResult && currentPlayer) {
    return (
      <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            被抽中的人是...
          </Typography>
          <Typography variant="h3" color="primary" sx={{ my: 3 }}>
            {currentPlayer.name}
          </Typography>
          <Typography color="text.secondary">
            請選擇真心話或大冒險
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          準備抽人！
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          誰會是下一個幸運兒？
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleDraw}
          disabled={drawing}
        >
          {drawing ? '抽取中...' : '抽！'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default PlayerDrawing;
```

**Step 2: Create src/components/ChoiceSelector.jsx**

```javascript
import { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Stack } from '@mui/material';
import { makeChoice } from '../services/roomService';

function ChoiceSelector({ room, roomCode, userId }) {
  const [loading, setLoading] = useState(false);

  const isCurrentPlayer = room.currentPlayerId === userId;
  const currentPlayer = room.players[room.currentPlayerId];

  const handleChoice = async (choice) => {
    setLoading(true);
    try {
      await makeChoice(roomCode, choice);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!isCurrentPlayer) {
    return (
      <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentPlayer?.name}
          </Typography>
          <Typography color="text.secondary">
            正在選擇真心話或大冒險...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          輪到你了！
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          選擇你的命運
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => handleChoice('truth')}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            真心話
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => handleChoice('dare')}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            大冒險
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ChoiceSelector;
```

**Step 3: Create src/components/QuestionForm.jsx**

```javascript
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import {
  submitQuestion,
  skipQuestion,
  checkAllSubmitted,
  getPoolCount,
  proceedToDrawQuestion,
} from '../services/roomService';

function QuestionForm({ room, roomCode, userId }) {
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [poolCount, setPoolCount] = useState(0);

  const isCurrentPlayer = room.currentPlayerId === userId;
  const currentPlayer = room.players[room.currentPlayerId];
  const choiceLabel = room.currentChoice === 'truth' ? '真心話' : '大冒險';
  const poolType = room.currentChoice === 'truth' ? 'truthPool' : 'darePool';

  // Check if current user already submitted
  useEffect(() => {
    const submittedBy = room.currentRound?.submittedBy || {};
    setSubmitted(!!submittedBy[userId]);
  }, [room.currentRound?.submittedBy, userId]);

  // Get current pool count
  useEffect(() => {
    if (room.currentPlayerId) {
      getPoolCount(roomCode, room.currentPlayerId, poolType).then(setPoolCount);
    }
  }, [roomCode, room.currentPlayerId, poolType, room.currentRound?.submittedBy]);

  // Check if all submitted and proceed
  useEffect(() => {
    const checkAndProceed = async () => {
      const allSubmitted = await checkAllSubmitted(roomCode);
      if (allSubmitted) {
        const count = await getPoolCount(roomCode, room.currentPlayerId, poolType);
        if (count > 0) {
          await proceedToDrawQuestion(roomCode);
        }
      }
    };

    if (!isCurrentPlayer && submitted) {
      checkAndProceed();
    }
  }, [submitted, roomCode, room.currentPlayerId, poolType, isCurrentPlayer]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await submitQuestion(roomCode, content.trim());
      setContent('');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await skipQuestion(roomCode);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Current player waits
  if (isCurrentPlayer) {
    return (
      <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <CardContent>
          <Chip label={choiceLabel} color={room.currentChoice === 'truth' ? 'primary' : 'secondary'} sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            等待出題中...
          </Typography>
          <Typography color="text.secondary">
            其他玩家正在為你準備題目
          </Typography>
          <Typography variant="h4" sx={{ mt: 2 }}>
            目前題庫: {poolCount} 題
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Already submitted
  if (submitted) {
    return (
      <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h6" color="success.main" gutterBottom>
            已提交！
          </Typography>
          <Typography color="text.secondary">
            等待其他玩家...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Chip label={choiceLabel} color={room.currentChoice === 'truth' ? 'primary' : 'secondary'} />
        </Box>
        <Typography variant="h6" gutterBottom>
          給 {currentPlayer?.name} 出題
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder={
            room.currentChoice === 'truth'
              ? '例如：你最尷尬的經驗是什麼？'
              : '例如：打電話給最近聯絡人說我愛你'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
          >
            提交
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleSkip}
            disabled={loading}
          >
            Skip
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default QuestionForm;
```

**Step 4: Create src/components/QuestionDrawing.jsx**

```javascript
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import { drawQuestion, getPoolCount, finishRound } from '../services/roomService';

function QuestionDrawing({ room, roomCode, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [poolCount, setPoolCount] = useState(0);

  const isCurrentPlayer = room.currentPlayerId === userId;
  const currentPlayer = room.players[room.currentPlayerId];
  const choiceLabel = room.currentChoice === 'truth' ? '真心話' : '大冒險';
  const poolType = room.currentChoice === 'truth' ? 'truthPool' : 'darePool';
  const drawnQuestion = room.currentRound?.drawnQuestion;

  useEffect(() => {
    if (room.currentPlayerId) {
      getPoolCount(roomCode, room.currentPlayerId, poolType).then(setPoolCount);
    }
  }, [roomCode, room.currentPlayerId, poolType]);

  const handleDraw = async () => {
    setLoading(true);
    setError('');
    try {
      await drawQuestion(roomCode);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await finishRound(roomCode);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Show drawn question (executing phase)
  if (room.currentPhase === 'executing' && drawnQuestion) {
    return (
      <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <CardContent>
          <Chip
            label={choiceLabel}
            color={room.currentChoice === 'truth' ? 'primary' : 'secondary'}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {currentPlayer?.name} 的任務
          </Typography>
          <Typography variant="h5" sx={{ my: 3, whiteSpace: 'pre-wrap' }}>
            {drawnQuestion}
          </Typography>
          {isCurrentPlayer && (
            <Button
              variant="contained"
              size="large"
              onClick={handleFinish}
              disabled={loading}
            >
              完成，抽下一位
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Draw question phase
  if (!isCurrentPlayer) {
    return (
      <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentPlayer?.name}
          </Typography>
          <Typography color="text.secondary">
            正在抽題目...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <CardContent>
        <Chip
          label={choiceLabel}
          color={room.currentChoice === 'truth' ? 'primary' : 'secondary'}
          sx={{ mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          準備好了嗎？
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          題庫中有 {poolCount} 題
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={handleDraw}
          disabled={loading || poolCount === 0}
        >
          {loading ? '抽取中...' : '抽題目！'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default QuestionDrawing;
```

**Step 5: Commit**

```bash
git add src/components/PlayerDrawing.jsx src/components/ChoiceSelector.jsx src/components/QuestionForm.jsx src/components/QuestionDrawing.jsx
git commit -m "feat: add game phase components"
```

---

## Task 10: RoomPage Integration

**Files:**
- Modify: `src/pages/RoomPage.jsx`

**Step 1: Update src/pages/RoomPage.jsx**

```javascript
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import RoomLobby from '../components/RoomLobby';
import PlayerDrawing from '../components/PlayerDrawing';
import ChoiceSelector from '../components/ChoiceSelector';
import QuestionForm from '../components/QuestionForm';
import QuestionDrawing from '../components/QuestionDrawing';
import PlayerList from '../components/PlayerList';
import { resetGame } from '../services/roomService';

function RoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { userId, loading: authLoading } = useAuth();
  const { room, loading: roomLoading, error } = useRoom(roomCode);

  if (authLoading || roomLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 2,
        }}
      >
        <Alert severity="error">{error || '房間不存在'}</Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          回首頁
        </Button>
      </Box>
    );
  }

  // Check if user is in the room
  const isInRoom = room.players && room.players[userId];
  if (!isInRoom) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 2,
        }}
      >
        <Alert severity="warning">你不在這個房間中</Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          回首頁加入房間
        </Button>
      </Box>
    );
  }

  const isHost = room.hostId === userId;

  const renderGamePhase = () => {
    switch (room.currentPhase) {
      case 'drawing':
        return <PlayerDrawing room={room} roomCode={roomCode} userId={userId} />;
      case 'choosing':
        return <ChoiceSelector room={room} roomCode={roomCode} userId={userId} />;
      case 'submitting':
        return <QuestionForm room={room} roomCode={roomCode} userId={userId} />;
      case 'drawingQuestion':
      case 'executing':
        return <QuestionDrawing room={room} roomCode={roomCode} userId={userId} />;
      default:
        return null;
    }
  };

  const handleReset = async () => {
    try {
      await resetGame(roomCode);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        gap: 3,
      }}
    >
      <Typography variant="h5">🫙 Truthjar</Typography>

      {room.status === 'waiting' ? (
        <RoomLobby room={room} roomCode={roomCode} userId={userId} />
      ) : (
        <>
          {renderGamePhase()}

          {/* Player list sidebar */}
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              玩家
            </Typography>
            <PlayerList
              players={room.players}
              hostId={room.hostId}
              currentUserId={userId}
            />
          </Box>

          {isHost && (
            <Button variant="outlined" color="warning" onClick={handleReset}>
              重置遊戲
            </Button>
          )}
        </>
      )}
    </Box>
  );
}

export default RoomPage;
```

**Step 2: Verify full game flow**

```bash
npm run dev
```

Test:
1. Create room in one browser tab
2. Copy URL, open in incognito window, join with different name
3. Start game as host
4. Play through: draw player → choose → submit questions → draw question → finish

**Step 3: Commit**

```bash
git add src/pages/RoomPage.jsx
git commit -m "feat: integrate all game phases in RoomPage"
```

---

## Task 11: Empty Pool Handling

**Files:**
- Modify: `src/components/QuestionForm.jsx`

**Step 1: Update QuestionForm to force resubmit on empty pool**

In `src/components/QuestionForm.jsx`, update the `useEffect` that checks all submitted:

```javascript
// Check if all submitted and proceed (or force resubmit if pool empty)
useEffect(() => {
  const checkAndProceed = async () => {
    const allSubmitted = await checkAllSubmitted(roomCode);
    if (allSubmitted) {
      const count = await getPoolCount(roomCode, room.currentPlayerId, poolType);
      if (count > 0) {
        await proceedToDrawQuestion(roomCode);
      } else {
        // Pool is empty, need to force resubmit
        // Reset submittedBy to force another round
        const { update, ref } = await import('firebase/database');
        const { db } = await import('../services/firebase');
        await update(ref(db, `rooms/${roomCode}/currentRound`), {
          submittedBy: {},
          forceSubmit: true,
        });
      }
    }
  };

  if (!isCurrentPlayer && submitted) {
    checkAndProceed();
  }
}, [submitted, roomCode, room.currentPlayerId, poolType, isCurrentPlayer]);

// Reset submitted state when forceSubmit is triggered
useEffect(() => {
  if (room.currentRound?.forceSubmit) {
    setSubmitted(false);
  }
}, [room.currentRound?.forceSubmit]);
```

Also add an alert when forced:

```javascript
// In the return statement, before the form:
{room.currentRound?.forceSubmit && !submitted && (
  <Alert severity="warning" sx={{ mb: 2 }}>
    題庫是空的！至少需要一題才能繼續。這次不能 Skip！
  </Alert>
)}
```

And disable skip when forced:

```javascript
<Button
  variant="outlined"
  fullWidth
  onClick={handleSkip}
  disabled={loading || room.currentRound?.forceSubmit}
>
  Skip
</Button>
```

**Step 2: Commit**

```bash
git add src/components/QuestionForm.jsx
git commit -m "feat: handle empty pool with forced resubmit"
```

---

## Task 12: README and Final Polish

**Files:**
- Create: `README.md`
- Modify: `index.html`

**Step 1: Update index.html title**

```html
<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Truthjar - 真心話大冒險</title>
    <meta name="description" content="免費線上真心話大冒險遊戲，支援多人連線、QR Code 加入、匿名出題" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 2: Create README.md**

```markdown
# Truthjar 🫙

免費線上真心話大冒險遊戲，專為聚會設計。

## 功能特色

- 🏠 **房間制** - 創建房間，分享代碼或 QR Code 讓朋友加入
- 🎭 **匿名出題** - 出題者身份保密，讓遊戲更刺激
- 🎲 **隨機抽取** - 隨機抽人、隨機抽題，命運由天決定
- ⚡ **即時同步** - 多人連線，畫面即時更新
- 💰 **完全免費** - 無廣告、無付費牆

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
```

**Step 3: Commit**

```bash
git add README.md index.html
git commit -m "docs: add README and update page metadata"
```

---

## Task 13: Build and Deploy

**Step 1: Build**

```bash
npm run build
```

Expected: Build completes without errors, `dist/` folder created.

**Step 2: Preview build locally**

```bash
npm run preview
```

Expected: App runs from built files.

**Step 3: Deploy to Firebase**

```bash
firebase deploy
```

Expected: App deployed, URL shown in terminal (e.g., https://truthjar.web.app)

**Step 4: Test production**

Open the deployed URL, test full game flow.

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: ready for production"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Project initialization (Vite, ESLint, Prettier) |
| 2 | Firebase setup (config, rules, auth) |
| 3 | MUI theme and routing |
| 4 | Room code utility |
| 5 | Room service (all game operations) |
| 6 | Custom hooks (useAuth, useRoom) |
| 7 | HomePage components |
| 8 | Room lobby (QR code, player list) |
| 9 | Game phase components |
| 10 | RoomPage integration |
| 11 | Empty pool handling |
| 12 | README and polish |
| 13 | Build and deploy |

Total: 13 tasks, estimated 50+ commits.
