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
        alert(`La imagen ${file.name} es demasiado grande. Máximo 5MB.`);
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
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-3">📸</div>
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Suelta las imágenes aquí...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium">Arrastra y suelta imágenes aquí</p>
            <p className="text-sm text-gray-400 mt-2">o haz clic para seleccionar</p>
            <p className="text-xs text-gray-400 mt-1">Máximo 5 imágenes, hasta 5MB cada una</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Preview ${index}`}
                className="w-full h-24 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;