const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
// const cron = require('node-cron'); // Comenta esto si no lo instalaste
const { archivePastEvents } = require('./controllers/eventController');

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
  res.json({ message: 'API funcionando correctamente' });
});

// Cron job opcional - si instalaste node-cron, descomenta esto
/*
cron.schedule('0 0 * * *', async () => {
  console.log('🕛 Ejecutando archivado automático de eventos...');
  await archivePastEvents();
});
*/

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📦 Límite de payload: 50MB`);
});