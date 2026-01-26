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
