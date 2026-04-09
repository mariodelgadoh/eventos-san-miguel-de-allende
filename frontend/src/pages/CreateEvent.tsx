import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
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

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    startDate: formatDateForInput(new Date().toISOString()),
    endDate: formatDateForInput(new Date(Date.now() + 3600000).toISOString()),
    category: 'Cultura',
  });

  const categories = [
    { name: 'Cultura', icon: '🎭', color: 'purple' },
    { name: 'Música', icon: '🎵', color: 'green' },
    { name: 'Gastronomía', icon: '🍽️', color: 'red' },
    { name: 'Arte', icon: '🎨', color: 'yellow' },
    { name: 'Deporte', icon: '⚽', color: 'blue' },
    { name: 'Religioso', icon: '⛪', color: 'indigo' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagesSelected = (files: File[]) => {
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
    setImageFiles([...imageFiles, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const localStartDate = new Date(formData.startDate);
      const localEndDate = new Date(formData.endDate);
      
      // Validar que endDate sea mayor que startDate
      if (localEndDate <= localStartDate) {
        alert('❌ La fecha de fin debe ser posterior a la fecha de inicio');
        setLoading(false);
        return;
      }
      
      const utcStartDate = localToUTC(localStartDate);
      const utcEndDate = localToUTC(localEndDate);
      
      const compressedImages = await Promise.all(
        imageFiles.map(file => compressImage(file, 0.5))
      );
      
      const eventData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        coordinates: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        },
        startDate: utcStartDate.toISOString(),
        endDate: utcEndDate.toISOString(),
        images: compressedImages,
        category: formData.category,
      };

      await eventService.createEvent(eventData);
      alert('✅ Evento creado exitosamente');
      navigate('/events');
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 413) {
        alert('Las imágenes son demasiado grandes. Por favor usa imágenes más pequeñas (menos de 500KB cada una)');
      } else {
        alert(error.response?.data?.message || 'Error al crear el evento');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">
              ✨ Crear Nuevo Evento
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Comparte tu evento con la comunidad de San Miguel de Allende
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
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
                Las imágenes se comprimirán automáticamente. Máximo 5 imágenes, 5MB cada una antes de comprimir.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800">
                📍 <strong>San Miguel de Allende</strong><br />
                Límites: Latitud 20.85° a 21.05° | Longitud -100.85° a -100.60°
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
              >
                {loading ? 'Creando...' : '✅ Publicar Evento'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/events')}
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

export default CreateEvent;