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
} from '@mui/material';
import { joinRoom } from '../services/roomService';
import { isValidRoomCode } from '../utils/roomCode';

function JoinRoomForm() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請輸入暱稱');
      return;
    }

    const code = roomCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) {
      setError('房間代碼格式不正確');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinRoom(code, name.trim());
      navigate(`/room/${code}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          加入房間
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="你的暱稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="房間代碼"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            disabled={loading}
            placeholder="例如: A3X7K9"
            inputProps={{ maxLength: 6 }}
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : '加入房間'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default JoinRoomForm;
