const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('../src/models/Event');

const migrateEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Encontrar eventos con date pero sin startDate/endDate
    const eventsToMigrate = await Event.find({
      startDate: { $exists: false }
    });

    console.log(`📦 Encontrados ${eventsToMigrate.length} eventos para migrar`);

    for (const event of eventsToMigrate) {
      // Si el evento tiene 'date' en lugar de 'startDate'
      if (event.date) {
        event.startDate = event.date;
        event.endDate = event.date;
        // Eliminar el campo 'date' si existe
        event.date = undefined;
        await event.save();
        console.log(`✅ Migrado evento: ${event.name}`);
      }
    }

    console.log('🎉 Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

migrateEvents();