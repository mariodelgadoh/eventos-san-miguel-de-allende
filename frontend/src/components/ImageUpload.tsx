import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesSelected, images, onRemoveImage }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`❌ ${file.name} es demasiado grande. Máximo 5MB.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      onImagesSelected(validFiles);
    }
  }, [onImagesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      {/* Área de Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-gray-400 bg-gray-50' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-2">
          <svg 
            className={`w-10 h-10 transition-colors ${isDragActive ? 'text-gray-600' : 'text-gray-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          
          {isDragActive ? (
            <p className="text-gray-600 text-sm">Suelta las imágenes aquí</p>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Arrastra y suelta tus imágenes
              </p>
              <p className="text-gray-400 text-xs mt-1">
                o haz clic para seleccionar
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                <span className="text-xs text-gray-400">JPG, PNG, GIF, WEBP</span>
                <span className="text-xs text-gray-400">Max 5MB</span>
                <span className="text-xs text-gray-400">Max 5 imágenes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Galería de previsualización */}
      {images.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {images.length} / 5 imágenes
            </span>
            <button
              onClick={() => images.forEach((_, i) => onRemoveImage(i))}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Eliminar todas
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
              >
                <img
                  src={img}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;