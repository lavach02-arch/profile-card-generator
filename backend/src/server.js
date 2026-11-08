import app from './app.js';

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  DevCard Studio Backend Server is running!`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/api/health`);
  console.log(`  API Base:    http://localhost:${PORT}/api/profiles`);
  console.log(`====================================================`);
});
