import { useState } from 'react';
import { Typography, Button, Card, CardContent, Stack } from '@mui/material';
import { makeChoice } from '../services/roomService';

function ChoiceSelector({ room, roomCode, userId }) {
  const [loading, setLoading] = useState(false);

  const isCurrentPlayer = room.currentPlayerId === userId;
  const currentPlayer = room.players[room.currentPlayerId];

  console.log('[ChoiceSelector] Rendering - Phase:', room.currentPhase, 'isCurrentPlayer:', isCurrentPlayer);

  const handleChoice = async (choice) => {
    console.log('[ChoiceSelector] Making choice:', choice);
    setLoading(true);
    try {
      await makeChoice(roomCode, choice);
      console.log('[ChoiceSelector] Choice made successfully');
    } catch (err) {
      console.error('[ChoiceSelector] Error making choice:', err);
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
