import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import ImageCarousel from '../components/ImageCarousel';
import { eventService } from '../services/api';
import { carouselService, CarouselImage } from '../services/carouselService';
import { Event } from '../types';

const Home: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [featured, upcoming, past, carousel] = await Promise.all([
          eventService.getEvents({ featured: true }).catch(() => []),
          eventService.getEvents({ type: 'upcoming' }).catch(() => []),
          eventService.getEvents({ type: 'past' }).catch(() => []),
          carouselService.getCarouselImages().catch(() => [])
        ]);
        
        setFeaturedEvents(Array.isArray(featured) ? featured.slice(0, 3) : []);
        setUpcomingEvents(Array.isArray(upcoming) ? upcoming.slice(0, 6) : []);
        setPastEvents(Array.isArray(past) ? past.slice(0, 3) : []);
        
        let imageUrls: string[] = [];
        if (Array.isArray(carousel)) {
          imageUrls = carousel.map((img: CarouselImage) => img.imageUrl);
        } else if (carousel && typeof carousel === 'object' && (carousel as any).imageUrl) {
          imageUrls = [(carousel as any).imageUrl];
        }
        
        setCarouselImages(imageUrls.length > 0 ? imageUrls : [
          '/images/hero/imagen1.jpg',
          '/images/hero/imagen2.jpg',
          '/images/hero/imagen3.jpg',
          '/images/hero/imagen4.jpg',
          '/images/hero/imagen5.jpg',
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar eventos');
        setCarouselImages([
          '/images/hero/imagen1.jpg',
          '/images/hero/imagen2.jpg',
          '/images/hero/imagen3.jpg',
          '/images/hero/imagen4.jpg',
          '/images/hero/imagen5.jpg',
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-gray-600"></div>
        <p className="mt-4 text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-light text-gray-800 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative h-screen max-h-[650px] overflow-hidden">
        <ImageCarousel images={carouselImages} interval={5000} />
        
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <div className="text-center max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] mb-4 font-light">San Miguel de Allende</p>
            <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
              Descubre lo que <span className="font-semibold">sucede</span>
            </h1>
            <p className="text-lg md:text-xl font-light mb-8 text-white/80">
              Eventos culturales, musicales y gastronómicos en la ciudad más hermosa de México
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="px-8 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition shadow-lg"
              >
                Explorar eventos
              </Link>
              <Link
                to="/create-event"
                className="px-8 py-3 border border-white text-white rounded-full font-medium hover:bg-white/10 transition"
              >
                Crear evento
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm uppercase tracking-wider text-gray-400">Lo mejor de SMA</span>
              <h2 className="text-3xl md:text-4xl font-light mt-2">Eventos Destacados</h2>
              <div className="w-12 h-0.5 bg-gray-300 mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Próximos Eventos */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm uppercase tracking-wider text-gray-400">Calendario</span>
            <h2 className="text-3xl md:text-4xl font-light mt-2">Próximos Eventos</h2>
            <div className="w-12 h-0.5 bg-gray-300 mx-auto mt-4"></div>
            <div className="mt-4">
              <Link to="/events" className="text-gray-500 hover:text-gray-800 transition inline-flex items-center gap-1">
                Ver todos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-gray-500">No hay eventos programados</p>
              <Link to="/create-event" className="inline-block mt-4 text-gray-600 hover:text-gray-900 underline">
                Sé el primero en crear uno
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm uppercase tracking-wider text-gray-400">Intereses</span>
            <h2 className="text-3xl md:text-4xl font-light mt-2">Explora por categoría</h2>
            <div className="w-12 h-0.5 bg-gray-300 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Cultura' },
              { name: 'Música' },
              { name: 'Gastronomía' },
              { name: 'Arte' },
              { name: 'Deporte' },
              { name: 'Religioso' },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/events?category=${category.name}`}
                className="group bg-white rounded-2xl p-6 text-center hover:shadow-md transition"
              >
                <span className="text-gray-700 font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-light mb-2">¿Organizas un evento?</h2>
          <p className="text-gray-500 mb-6">Comparte tu evento con la comunidad de San Miguel de Allende</p>
          <Link
            to="/create-event"
            className="inline-block px-8 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition"
          >
            Crear evento
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;