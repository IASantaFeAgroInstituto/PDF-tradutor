import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxSize?: number; // in bytes
}

export function FileUpload({ onFileSelect, maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === 'application/pdf' && file.size <= maxSize
      );
      onFileSelect(files);
    },
    [maxSize, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
        ? Array.from(e.target.files).filter(
            (file) => file.type === 'application/pdf' && file.size <= maxSize
          )
        : [];
      onFileSelect(files);
    },
    [maxSize, onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
    >
      <div className="flex flex-col items-center gap-4">
        <Upload className="h-12 w-12 text-gray-400" />
        <div>
          <p className="text-lg font-medium text-gray-700">
            Drag and drop your PDF files here
          </p>
          <p className="text-sm text-gray-500">or</p>
        </div>
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Browse Files
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf"
            onChange={handleFileInput}
          />
        </label>
        <p className="text-sm text-gray-500">
          Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>
    </div>
  );
}