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
    'currentRound/submittedBy': {},
    'currentRound/forceSubmit': false,
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
