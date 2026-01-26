import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { joinRoom } from '../services/roomService';

function QuickJoinForm({ roomCode, roomName }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請輸入暱稱');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinRoom(roomCode, name.trim());
      // Force a refresh by navigating away and back
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

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
      <Typography variant="h5">🫙 Truthjar</Typography>

      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            加入房間
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            房間代碼：<strong>{roomCode}</strong>
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="你的暱稱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
              sx={{ mb: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : '加入房間'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Button variant="text" onClick={() => navigate('/')}>
        返回首頁
      </Button>
    </Box>
  );
}

export default QuickJoinForm;
