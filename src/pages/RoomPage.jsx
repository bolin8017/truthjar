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
    console.log('[RoomPage] Current phase:', room.currentPhase, 'Current player:', room.currentPlayerId, 'My userId:', userId);

    switch (room.currentPhase) {
      case 'drawing':
        console.log('[RoomPage] Rendering PlayerDrawing');
        return <PlayerDrawing room={room} roomCode={roomCode} userId={userId} />;
      case 'choosing':
        console.log('[RoomPage] Rendering ChoiceSelector');
        return <ChoiceSelector room={room} roomCode={roomCode} userId={userId} />;
      case 'submitting':
        console.log('[RoomPage] Rendering QuestionForm');
        return <QuestionForm room={room} roomCode={roomCode} userId={userId} />;
      case 'drawingQuestion':
      case 'executing':
        console.log('[RoomPage] Rendering QuestionDrawing');
        return <QuestionDrawing room={room} roomCode={roomCode} userId={userId} />;
      default:
        console.log('[RoomPage] Unknown phase, rendering nothing');
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
