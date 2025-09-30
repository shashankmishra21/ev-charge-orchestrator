import express from 'express';
import cors from 'cors';
import stationRoutes from './routes/stations';
import authRoutes from './routes/auth'; // Add this import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stations', stationRoutes);
app.use('/api/auth', authRoutes); // Add this line

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EV Orchestrator API is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏪 Stations API: http://localhost:${PORT}/api/stations`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});
