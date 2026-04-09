import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { eventService, favoriteService } from '../services/api';
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';

const EventsList: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // ✅ CATEGORÍAS COMPLETAS CON RELIGIOSO
  const categories = ['Cultura', 'Música', 'Gastronomía', 'Arte', 'Deporte', 'Religioso'];

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
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favs = await favoriteService.getFavorites();
      setFavorites(favs.map(f => f.event._id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const filterEvents = () => {
    let filteredUpcoming = [...upcomingEvents];
    let filteredPast = [...pastEvents];
    
    if (searchTerm) {
      const filterFn = (event: Event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      filteredUpcoming = filteredUpcoming.filter(filterFn);
      filteredPast = filteredPast.filter(filterFn);
    }
    
    if (selectedCategory) {
      filteredUpcoming = filteredUpcoming.filter(event => event.category === selectedCategory);
      filteredPast = filteredPast.filter(event => event.category === selectedCategory);
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
      <div className="flex justify-center items-center h-64 sm:h-96">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-8">
          📅 Eventos en San Miguel de Allende
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          <div className="flex gap-2 sm:gap-4">
            <input
              type="text"
              placeholder="🔍 Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm sm:text-base"
            />
          </div>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition ${
                selectedCategory === '' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs responsivos */}
      <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2 sm:pb-3 px-2 sm:px-4 font-semibold text-sm sm:text-base transition ${
            activeTab === 'upcoming'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📅 Próximos ({filteredUpcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-2 sm:pb-3 px-2 sm:px-4 font-semibold text-sm sm:text-base transition ${
            activeTab === 'past'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📜 Pasados ({filteredPast.length})
        </button>
      </div>

      {/* Eventos Grid */}
      {currentEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {currentEvents.map(event => (
            <EventCard
              key={event._id}
              event={event}
              onFavorite={() => handleFavorite(event._id)}
              isFavorite={favorites.includes(event._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl shadow-md">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
            {activeTab === 'upcoming' ? '📭' : '📜'}
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
            {activeTab === 'upcoming' 
              ? 'No hay eventos próximos' 
              : 'No hay eventos pasados'}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base px-4">
            {activeTab === 'upcoming' 
              ? '¡Sé el primero en crear un evento!' 
              : 'Los eventos pasados aparecerán aquí cuando finalicen'}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              to="/create-event"
              className="inline-block mt-4 sm:mt-6 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-blue-700 transition"
            >
              Crear evento
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsList;