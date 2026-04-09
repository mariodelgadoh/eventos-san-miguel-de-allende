import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { Event, Category } from '../types';
import { localToUTC, formatDateForInput } from '../utils/dateUtils';

const compressImage = (file: File, maxSizeMB: number = 0.5): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxWidth = 1200;
        const maxHeight = 1200;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        let quality = 0.7;
        let result = canvas.toDataURL('image/jpeg', quality);
        
        while (result.length > maxSizeMB * 1024 * 1024 && quality > 0.3) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(result);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    startDate: '',
    endDate: '',
    category: 'Cultura' as Category,
  });

  const categories = [
    { name: 'Cultura' as Category, icon: '🎭', color: 'purple' },
    { name: 'Música' as Category, icon: '🎵', color: 'green' },
    { name: 'Gastronomía' as Category, icon: '🍽️', color: 'red' },
    { name: 'Arte' as Category, icon: '🎨', color: 'yellow' },
    { name: 'Deporte' as Category, icon: '⚽', color: 'blue' },
    { name: 'Religioso' as Category, icon: '⛪', color: 'indigo' },
  ];

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const data = await eventService.getEventById(id!);
      setEvent(data);
      setImages(data.images || []);
      setFormData({
        name: data.name,
        description: data.description,
        address: data.address,
        lat: data.coordinates.lat.toString(),
        lng: data.coordinates.lng.toString(),
        startDate: formatDateForInput(data.startDate),
        endDate: formatDateForInput(data.endDate),
        category: data.category,
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Error al cargar el evento');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'category' ? value as Category : value,
    });
  };

  const handleImagesSelected = (files: File[]) => {
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
    setNewImageFiles([...newImageFiles, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    const removedImage = images[index];
    setImages(images.filter((_, i) => i !== index));
    
    if (removedImage && removedImage.startsWith('blob:')) {
      setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin && event?.organizer._id !== user?._id) {
      alert('No tienes permiso para editar este evento');
      return;
    }
    
    setSaving(true);

    try {
      const localStartDate = new Date(formData.startDate);
      const localEndDate = new Date(formData.endDate);
      
      // Validar que endDate sea mayor que startDate
      if (localEndDate <= localStartDate) {
        alert('❌ La fecha de fin debe ser posterior a la fecha de inicio');
        setSaving(false);
        return;
      }
      
      const utcStartDate = localToUTC(localStartDate);
      const utcEndDate = localToUTC(localEndDate);
      
      const compressedNewImages = await Promise.all(
        newImageFiles.map(file => compressImage(file, 0.5))
      );
      
      const keptImages = images.filter(img => !img.startsWith('blob:'));
      const allImages = [...keptImages, ...compressedNewImages];
      
      const eventData: Partial<Event> = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        coordinates: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        },
        images: allImages,
        startDate: utcStartDate.toISOString(),
        endDate: utcEndDate.toISOString(),
        category: formData.category,
      };

      await eventService.updateEvent(id!, eventData);
      alert('✅ Evento actualizado exitosamente');
      navigate(`/events/${id}`);
    } catch (error: any) {
      console.error('Error updating event:', error);
      if (error.response?.status === 413) {
        alert('Las imágenes son demasiado grandes. Por favor usa imágenes más pequeñas (menos de 500KB cada una)');
      } else {
        alert(error.response?.data?.message || 'Error al actualizar el evento');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin && event?.organizer._id !== user?._id) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-gray-800">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">No tienes permiso para editar este evento</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition"
          >
            Volver a eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">
              ✏️ Editar Evento
            </h1>
            <p className="text-yellow-100 text-center mt-2">
              Modifica la información de tu evento
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📝 Nombre del evento *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
                placeholder="Ej: Festival de Jazz 2024"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📖 Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
                placeholder="Describe tu evento en detalle..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📍 Dirección *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
                placeholder="Calle Principal #123, Zona Centro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  🗺️ Latitud *
                </label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
                  placeholder="Ej: 20.9141"
                />
                <p className="text-xs text-gray-500 mt-1">Rango: 20.85 - 21.05</p>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  🗺️ Longitud *
                </label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
                  placeholder="Ej: -100.748"
                />
                <p className="text-xs text-gray-500 mt-1">Rango: -100.85 - -100.60</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  🗓️ Fecha y hora de inicio *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  🗓️ Fecha y hora de fin *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Hora de San Miguel de Allende (México)</p>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                🏷️ Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                🖼️ Imágenes del evento
              </label>
              <ImageUpload
                onImagesSelected={handleImagesSelected}
                images={images}
                onRemoveImage={handleRemoveImage}
              />
              <p className="text-xs text-gray-500 mt-2">
                Las imágenes se comprimirán automáticamente. Haz clic en la X para eliminar imágenes existentes.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-sm text-yellow-800">
                📍 <strong>San Miguel de Allende</strong><br />
                Límites: Latitud 20.85° a 21.05° | Longitud -100.85° a -100.60°
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/events/${id}`)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;