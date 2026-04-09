import React, { useState, useEffect } from 'react';
import { carouselService, CarouselImage } from '../../services/carouselService';
import { useToast } from '../../contexts/ToastContext';

const CarouselManager: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    order: 0
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await carouselService.getAllCarouselImages();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      showToast('Error al cargar las imágenes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      showToast('Debes ingresar una URL de imagen', 'error');
      return;
    }
    
    try {
      if (editingImage) {
        await carouselService.updateCarouselImage(editingImage._id, {
          imageUrl: formData.imageUrl,
          title: formData.title,
          order: formData.order
        });
        showToast('Imagen actualizada exitosamente', 'success');
      } else {
        await carouselService.addCarouselImage({
          imageUrl: formData.imageUrl,
          title: formData.title,
          order: formData.order
        });
        showToast('Imagen agregada exitosamente', 'success');
      }
      setShowModal(false);
      setEditingImage(null);
      setFormData({ imageUrl: '', title: '', order: images.length });
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      showToast('Error al guardar la imagen', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      try {
        await carouselService.deleteCarouselImage(id);
        showToast('Imagen eliminada exitosamente', 'success');
        fetchImages();
      } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Error al eliminar la imagen', 'error');
      }
    }
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingImage(image);
    setFormData({
      imageUrl: image.imageUrl,
      title: image.title || '',
      order: image.order
    });
    setShowModal(true);
  };

  const handleToggleActive = async (image: CarouselImage) => {
    try {
      await carouselService.updateCarouselImage(image._id, { isActive: !image.isActive });
      showToast(`Imagen ${image.isActive ? 'desactivada' : 'activada'} exitosamente`, 'success');
      fetchImages();
    } catch (error) {
      console.error('Error toggling image:', error);
      showToast('Error al cambiar estado de la imagen', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('¿Estás seguro de restaurar las 5 imágenes por defecto? Esto eliminará las imágenes actuales.')) {
      try {
        await carouselService.initializeDefaultImages();
        showToast('Imágenes por defecto restauradas', 'success');
        fetchImages();
      } catch (error) {
        console.error('Error resetting images:', error);
        showToast('Error al restaurar imágenes', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-gray-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-lg font-medium text-gray-800">Imágenes del Carrusel</h2>
        <div className="flex gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition"
          >
            Restaurar imágenes por defecto
          </button>
          <button
            onClick={() => {
              setEditingImage(null);
              setFormData({ imageUrl: '', title: '', order: images.length });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Agregar imagen
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Puedes agregar imágenes usando URLs externas. Las 5 imágenes originales están guardadas y puedes restaurarlas.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Imagen</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Título</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Orden</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {images.map((image, idx) => (
              <tr key={image._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img 
                    src={image.imageUrl} 
                    alt={image.title} 
                    className="w-20 h-14 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/80x60?text=Error';
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{image.imageUrl}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="font-medium text-gray-800">{image.title || `Imagen ${idx + 1}`}</div>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{image.order}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    image.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {image.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(image)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleActive(image)}
                      className="p-1.5 text-gray-400 hover:text-yellow-600 transition rounded-lg hover:bg-yellow-50"
                      title={image.isActive ? 'Desactivar' : 'Activar'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {editingImage ? 'Editar imagen' : 'Agregar imagen'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">URL de la imagen *</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  required
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img src={formData.imageUrl} alt="Preview" className="w-32 h-20 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Título (opcional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  placeholder="Título de la imagen"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Orden</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  {editingImage ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingImage(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselManager;