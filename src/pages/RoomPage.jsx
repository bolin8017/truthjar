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
