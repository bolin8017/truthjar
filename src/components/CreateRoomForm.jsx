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
import { createRoom } from '../services/roomService';

function CreateRoomForm() {
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
      const roomCode = await createRoom(name.trim());
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          創建房間
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="你的暱稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : '創建房間'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CreateRoomForm;
