import React, { useCallback } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { parseGlossaryFile } from '../../utils/fileParser';
import { GlossaryEntry } from '../../types';

interface GlossaryFileUploadProps {
  onEntriesLoaded: (entries: GlossaryEntry[]) => void;
  onError: (error: string) => void;
}

export function GlossaryFileUpload({ onEntriesLoaded, onError }: GlossaryFileUploadProps) {
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const entries = await parseGlossaryFile(file);
      onEntriesLoaded(entries);
    } catch (error) {
      onError('Failed to parse file. Please ensure it\'s a valid CSV file.');
    }
  }, [onEntriesLoaded, onError]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
    >
      <div className="flex flex-col items-center gap-3">
        <Upload className="h-8 w-8 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-700">
            Drag and drop your glossary file here
          </p>
          <p className="text-xs text-gray-500">or</p>
        </div>
        <label className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700">
          Browse Files
          <input
            type="file"
            className="hidden"
            accept=".csv,.txt"
            onChange={handleFileInput}
          />
        </label>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Accepted formats: CSV</p>
          <p>Format: source_text,target_text[,context,category]</p>
        </div>
      </div>
    </div>
  );
}