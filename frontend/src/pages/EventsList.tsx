import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import EventCarousel from '../components/EventCarousel';
import { eventService, favoriteService } from '../services/api';
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';

const EventsList: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [carouselEvents, setCarouselEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const categories = [
    { name: 'Cultura' },
    { name: 'Música' },
    { name: 'Gastronomía' },
    { name: 'Arte' },
    { name: 'Deporte' },
    { name: 'Religioso' },
  ];

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    const tabParam = searchParams.get('tab');
    if (tabParam === 'past') {
      setActiveTab('past');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [upcomingEvents, pastEvents, searchTerm, selectedCategory]);

  const fetchEvents = async () => {
    try {
      const [upcoming, past] = await Promise.all([
        eventService.getEvents({ type: 'upcoming' }),
        eventService.getEvents({ type: 'past' })
      ]);
      setUpcomingEvents(upcoming || []);
      setPastEvents(past || []);
      setCarouselEvents((upcoming || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching events:', error);
      setUpcomingEvents([]);
      setPastEvents([]);
      setCarouselEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favs = await favoriteService.getFavorites();
      // Filtrar favoritos que tengan evento válido
      const validFavs = favs.filter(f => f.event && f.event._id);
      setFavorites(validFavs.map(f => f.event._id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
  };

  const filterEvents = () => {
    let filteredUpcoming = [...(upcomingEvents || [])];
    let filteredPast = [...(pastEvents || [])];
    
    if (searchTerm) {
      const filterFn = (event: Event) =>
        event && (event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      filteredUpcoming = filteredUpcoming.filter(filterFn);
      filteredPast = filteredPast.filter(filterFn);
    }
    
    if (selectedCategory) {
      filteredUpcoming = filteredUpcoming.filter(event => event && event.category === selectedCategory);
      filteredPast = filteredPast.filter(event => event && event.category === selectedCategory);
    }
    
    return { filteredUpcoming, filteredPast };
  };

  const handleFavorite = async (eventId: string) => {
    if (!user) {
      alert('Inicia sesión para guardar favoritos');
      return;
    }
    
    try {
      if (favorites.includes(eventId)) {
        await favoriteService.removeFavorite(eventId);
        setFavorites(favorites.filter(id => id !== eventId));
      } else {
        await favoriteService.addFavorite(eventId);
        setFavorites([...favorites, eventId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const { filteredUpcoming, filteredPast } = filterEvents();
  const currentEvents = activeTab === 'upcoming' ? filteredUpcoming : filteredPast;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-gray-600"></div>
        <p className="mt-4 text-gray-400 text-sm">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Carrusel de Eventos */}
      {carouselEvents.length > 0 ? (
        <EventCarousel events={carouselEvents} interval={6000} />
      ) : (
        <div className="h-screen bg-gray-800 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-2xl font-light mb-2">Próximamente</h2>
            <p className="text-gray-400 text-sm">Pronto habrá nuevos eventos en San Miguel de Allende</p>
          </div>
        </div>
      )}

      {/* Búsqueda y lista de eventos */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Tarjeta de Búsqueda */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar eventos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategory === cat.name 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              Próximos
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'upcoming' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {filteredUpcoming.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              Pasados
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'past' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {filteredPast.length}
              </span>
            </span>
          </button>
        </div>

        {/* Grid de Eventos */}
        {currentEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvents.map(event => (
              <div key={event._id} className="transition-all duration-300 hover:-translate-y-1">
                <EventCard
                  event={event}
                  onFavorite={() => handleFavorite(event._id)}
                  isFavorite={favorites.includes(event._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              {activeTab === 'upcoming' ? 'No hay eventos próximos' : 'No hay eventos pasados'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {activeTab === 'upcoming' 
                ? 'Sé el primero en crear un evento' 
                : 'Los eventos pasados aparecerán aquí cuando finalicen'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                to="/create-event"
                className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                Crear evento
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;