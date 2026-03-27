const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const commentRoutes = require('./routes/commentRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conectar a MongoDB
connectDB();

// ============ RUTAS DE API ============
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

// ============ RUTAS DE PRUEBA ============
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// ============ RUTA RAÍZ ============
app.get('/', (req, res) => {
  res.json({
    name: 'Eventos San Miguel de Allende API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      test: '/api/test',
      events: '/api/events',
      auth: '/api/auth',
      comments: '/api/comments/:eventId',
      favorites: '/api/favorites',
      admin: '/api/admin'
    },
    documentation: 'https://github.com/mariodelgadoh/eventos-san-miguel-de-allende'
  });
});

// ============ SERVIDOR DEL FRONTEND (SOLO EN PRODUCCIÓN) ============
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos del frontend
  const frontendPath = path.join(__dirname, '../../frontend/build');
  app.use(express.static(frontendPath));
  
  // Cualquier otra ruta no manejada por la API, enviar index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ============ INICIAR SERVIDOR ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📦 Límite de payload: 50MB`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}/api/test`);
});