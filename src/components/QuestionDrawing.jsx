import { useState, useEffect } from 'react';
import {
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
