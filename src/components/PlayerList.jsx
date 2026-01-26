import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';

function PlayerList({ players, hostId, currentUserId, onKick, showKick = false }) {
  const playerEntries = Object.entries(players || {});

  return (
    <List>
      {playerEntries.map(([playerId, player]) => (
        <ListItem key={playerId}>
          <ListItemIcon>
            {playerId === hostId ? (
              <StarIcon color="primary" />
            ) : (
              <PersonIcon />
            )}
          </ListItemIcon>
          <ListItemText
            primary={player.name}
            secondary={playerId === currentUserId ? '(你)' : null}
          />
          {playerId === hostId && (
            <Chip label="房主" size="small" color="primary" variant="outlined" />
          )}
          {showKick && playerId !== hostId && playerId !== currentUserId && (
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => onKick(playerId)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}

export default PlayerList;
