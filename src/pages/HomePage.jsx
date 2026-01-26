import { Box, Typography } from '@mui/material';

function HomePage() {
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
      <Typography variant="h4" gutterBottom>
        Truthjar
      </Typography>
      <Typography color="text.secondary">
        真心話大冒險
      </Typography>
    </Box>
  );
}

export default HomePage;
