import { useState, useEffect } from 'react';
import { Typography, Button, Card, CardContent } from '@mui/material';
import { drawPlayer } from '../services/roomService';

function PlayerDrawing({ room, roomCode }) {
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
