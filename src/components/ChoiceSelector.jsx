import { useState } from 'react';
import { Typography, Button, Card, CardContent, Stack } from '@mui/material';
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
