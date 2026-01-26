import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import { ref, update } from 'firebase/database';
import { db } from '../services/firebase';
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
  const forceSubmit = room.currentRound?.forceSubmit;

  // Check if current user already submitted
  useEffect(() => {
    const submittedBy = room.currentRound?.submittedBy || {};
    setSubmitted(!!submittedBy[userId]);
  }, [room.currentRound?.submittedBy, userId]);

  // Reset submitted state when forceSubmit is triggered
  useEffect(() => {
    if (forceSubmit) {
      setSubmitted(false);
    }
  }, [forceSubmit]);

  // Get current pool count
  useEffect(() => {
    if (room.currentPlayerId) {
      getPoolCount(roomCode, room.currentPlayerId, poolType).then(setPoolCount);
    }
  }, [roomCode, room.currentPlayerId, poolType, room.currentRound?.submittedBy]);

  // Check if all submitted and proceed (or force resubmit if pool empty)
  useEffect(() => {
    const checkAndProceed = async () => {
      console.log('[QuestionForm] Checking if all submitted...');
      const allSubmitted = await checkAllSubmitted(roomCode);
      console.log('[QuestionForm] All submitted:', allSubmitted);

      if (allSubmitted) {
        const count = await getPoolCount(roomCode, room.currentPlayerId, poolType);
        console.log('[QuestionForm] Pool count:', count);

        if (count > 0) {
          console.log('[QuestionForm] Proceeding to draw question');
          await proceedToDrawQuestion(roomCode);
        } else {
          // Pool is empty, need to force resubmit
          console.log('[QuestionForm] Pool is empty, forcing resubmit');
          // Check if this is already in forceSubmit state to prevent infinite loop
          if (!forceSubmit) {
            // Reset submittedBy to force another round
            await update(ref(db, `rooms/${roomCode}/currentRound`), {
              submittedBy: {},
              forceSubmit: true,
            });
          }
          // If forceSubmit is already true and pool still empty, we're waiting for submissions
          // The UI will show the warning and disable Skip button
        }
      }
    };

    console.log('[QuestionForm] useEffect triggered - isCurrentPlayer:', isCurrentPlayer, 'submitted:', submitted, 'forceSubmit:', forceSubmit);
    if (!isCurrentPlayer && submitted) {
      checkAndProceed();
    }
  }, [submitted, roomCode, room.currentPlayerId, poolType, isCurrentPlayer, forceSubmit]);

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
        {forceSubmit && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            題庫是空的！至少需要一題才能繼續。這次不能 Skip！
          </Alert>
        )}
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
            disabled={loading || forceSubmit}
          >
            Skip
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default QuestionForm;
