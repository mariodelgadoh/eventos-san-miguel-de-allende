import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import ImageCarousel from '../components/ImageCarousel';
import { eventService } from '../services/api';
import { Event } from '../types';

// ============================================
// 📸 AQUÍ PONES TUS IMÁGENES
// ============================================
// Coloca tus imágenes en: frontend/public/images/hero/
// Luego lista los nombres de tus imágenes aquí:
const heroImages = [
  '/images/hero/imagen1.jpg',
  '/images/hero/imagen2.jpg',
  '/images/hero/imagen3.jpg',
  '/images/hero/imagen4.jpg',
  '/images/hero/imagen5.jpg',
];
// ============================================

const Home: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [featured, upcoming, past] = await Promise.all([
          eventService.getEvents({ featured: true }).catch(() => []),
          eventService.getEvents({ type: 'upcoming' }).catch(() => []),
          eventService.getEvents({ type: 'past' }).catch(() => [])
        ]);
        
        setFeaturedEvents(Array.isArray(featured) ? featured.slice(0, 3) : []);
        setUpcomingEvents(Array.isArray(upcoming) ? upcoming.slice(0, 6) : []);
        setPastEvents(Array.isArray(past) ? past.slice(0, 3) : []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 sm:h-96">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 rounded-xl p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section con Carrusel de Imágenes */}
      <div className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        <ImageCarousel images={heroImages} interval={5000} />
        
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 animate-fade-in">
               Descubre los mejores eventos
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-2 sm:mb-4">
              en San Miguel de Allende
            </p>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Cultura, música, gastronomía, arte y deporte en la ciudad más hermosa de México
            </p>
            <Link
              to="/events"
              className="inline-block bg-white text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Explorar eventos →
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-12">
            ⭐ Eventos Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-0">
            📅 Próximos Eventos
          </h2>
          <Link to="/events" className="text-blue-600 hover:underline text-sm sm:text-base">
            Ver todos →
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No hay eventos próximos</p>
            <Link
              to="/create-event"
              className="inline-block mt-3 text-blue-600 hover:underline text-sm sm:text-base"
            >
              ¡Crea el primer evento!
            </Link>
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-3 sm:mb-0">
              📜 Eventos que ya pasaron
            </h2>
            <Link to="/events" className="text-blue-600 hover:underline text-sm sm:text-base">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {pastEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-12">
            📂 Explora por categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[
              { name: 'Cultura', icon: '🎭', color: 'purple' },
              { name: 'Música', icon: '🎵', color: 'green' },
              { name: 'Gastronomía', icon: '🍽️', color: 'red' },
              { name: 'Arte', icon: '🎨', color: 'yellow' },
              { name: 'Deporte', icon: '⚽', color: 'blue' },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/events?category=${category.name}`}
                className={`bg-${category.color}-50 p-4 sm:p-6 text-center rounded-xl hover:shadow-lg transition transform hover:scale-105 border-2 border-${category.color}-200`}
              >
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{category.icon}</div>
                <span className={`font-semibold text-${category.color}-700 text-xs sm:text-sm`}>
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;