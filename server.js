import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import postRoutes from './routes/postRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import pwdIdApplicationRoutes from './routes/pwdIdApplicationRoutes.js'
import spIdApplicationRoutes from './routes/spIdApplicationRoutes.js'
import seniorIdApplicationRoutes from './routes/seniorIdApplicationRoutes.js'
import hazardMapRoutes from './routes/hazardMapRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import databankRoutes from './routes/databankRoutes.js'

// INITIALIZE EXPRESS APP
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'http://192.168.0.190:5173',
    'http://192.168.0.101:4173',
    'https://e-tbayatmswdo.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/activityLog', activityLogRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/pwd', pwdIdApplicationRoutes);
app.use('/api/soloParent', spIdApplicationRoutes);
app.use('/api/seniorCitizen', seniorIdApplicationRoutes);
app.use('/api/hazardMap', hazardMapRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/databank', databankRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
