import { useState, useEffect } from 'react';
import { subscribeToRoom } from '../services/roomService';

export function useRoom(roomCode) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
      if (roomData) {
        setRoom(roomData);
        setError(null);
      } else {
        setRoom(null);
        setError('房間不存在');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [roomCode]);

  return { room, loading, error };
}
