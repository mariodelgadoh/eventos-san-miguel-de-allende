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
    { name: 'Cultura' },
    { name: 'Música' },
    { name: 'Gastronomía' },
    { name: 'Arte' },
    { name: 'Deporte' },
    { name: 'Religioso' },
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
      
      if (localEndDate <= localStartDate) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
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
      alert('Evento creado exitosamente');
      navigate('/events');
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 413) {
        alert('Las imágenes son demasiado grandes. Por favor usa imágenes más pequeñas');
      } else {
        alert(error.response?.data?.message || 'Error al crear el evento');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-gray-800">Crear Evento</h1>
          <p className="text-gray-400 text-sm mt-2">Comparte tu evento con la comunidad</p>
          <div className="w-12 h-0.5 bg-gray-200 mx-auto mt-4"></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Nombre del evento <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50"
                  placeholder="Ej: Festival de Jazz 2024"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Descripción <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50 resize-none"
                  placeholder="Describe tu evento en detalle..."
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Dirección <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50"
                  placeholder="Calle Principal #123, Zona Centro"
                />
              </div>

              {/* Coordenadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Latitud *</label>
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50"
                    placeholder="Ej: 20.9141"
                  />
                  <p className="text-xs text-gray-400 mt-1">Rango: 20.85 - 21.05</p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Longitud *</label>
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={formData.lng}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50"
                    placeholder="Ej: -100.748"
                  />
                  <p className="text-xs text-gray-400 mt-1">Rango: -100.85 - -100.60</p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Fecha y hora de inicio *</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Fecha y hora de fin *</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-gray-50"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 -mt-2">Hora de San Miguel de Allende (México)</p>

              {/* Categorías - Centradas y responsivas */}
              <div>
                <label className="block text-gray-600 text-sm mb-3 text-center">Categoría *</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.name })}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        formData.category === cat.name
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-gray-600 text-sm mb-2">Imágenes del evento</label>
                <ImageUpload
                  onImagesSelected={handleImagesSelected}
                  images={images}
                  onRemoveImage={handleRemoveImage}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Máximo 5 imágenes, 5MB cada una
                </p>
              </div>

              {/* Información de ubicación */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">📍</span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">San Miguel de Allende</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Límites: Latitud 20.85° - 21.05° | Longitud -100.85° - -100.60°
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Publicando...' : 'Publicar evento'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="px-6 py-2 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition border border-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;