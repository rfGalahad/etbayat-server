import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import postRoutes from './routes/postRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import duplicateRoutes from './routes/duplicateRoutes.js'
import pwdIdApplicationRoutes from './routes/pwdIdApplicationRoutes.js'
import spIdApplicationRoutes from './routes/spIdApplicationRoutes.js'
import seniorIdApplicationRoutes from './routes/seniorIdApplicationRoutes.js'
import hazardMapRoutes from './routes/hazardMapRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import databankRoutes from './routes/databankRoutes.js'
import getAllIdInformationRoutes from './routes/idInformationRoutes.js'

import { errorHandler } from './middlewares/errorHandler.js';

// INITIALIZE EXPRESS APP
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/activityLog', activityLogRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/duplicate', duplicateRoutes);
app.use('/api/pwd', pwdIdApplicationRoutes);
app.use('/api/soloParent', spIdApplicationRoutes);
app.use('/api/seniorCitizen', seniorIdApplicationRoutes);
app.use('/api/hazardMap', hazardMapRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/databank', databankRoutes);
app.use('/api/idInformation', getAllIdInformationRoutes);

app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
