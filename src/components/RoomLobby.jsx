import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
