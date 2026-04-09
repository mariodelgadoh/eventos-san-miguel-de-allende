process.env.TZ = 'America/Mexico_City';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const commentRoutes = require('./routes/commentRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    status: 'online',
    timezone: process.env.TZ,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Eventos San Miguel de Allende API',
    version: '1.0.0',
    status: 'active',
    timezone: process.env.TZ,
    endpoints: {
      test: '/api/test',
      events: '/api/events',
      auth: '/api/auth',
      comments: '/api/comments/:eventId',
      favorites: '/api/favorites',
      admin: '/api/admin',
      password: '/api/password'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📦 Límite de payload: 50MB`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕐 Zona horaria: ${process.env.TZ}`);
});