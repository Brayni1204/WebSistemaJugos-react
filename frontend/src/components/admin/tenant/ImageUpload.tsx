// src/components/admin/tenant/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  aspectRatio?: string; // e.g., '1/1' for square, '16/9' for landscape
}

const ImageUpload = ({ label, currentImageUrl, onFileSelect, aspectRatio = '16 / 9' }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setPreviewUrl(null);
      onFileSelect(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        className="relative group bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors cursor-pointer"
        style={{ aspectRatio }}
        onClick={triggerFileInput}
      >
        {displayUrl ? (
          <>
            <img src={displayUrl} alt={`${label} Preview`} className="w-full h-full object-contain rounded-lg" />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm rounded-full p-1 text-gray-700 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <UploadCloud className="h-8 w-8 mb-2" />
            <span className="text-sm font-semibold">Click to upload</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/svg+xml, image/x-icon"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
