import React, { useState } from 'react';
import { Download, Search, FileText, Calendar, Globe2, ArrowDownToLine } from 'lucide-react';
import { TranslationJob } from '../../types';

interface TranslatedDocumentsProps {
  jobs: TranslationJob[];
}

export function TranslatedDocuments({ jobs }: TranslatedDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const completedJobs = jobs.filter(job => 
    job.status === 'completed' &&
    (job.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     job.sourceLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
     job.targetLanguage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Translated Documents</h2>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {completedJobs.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No translated documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your translated documents will appear here once they're ready.
            </p>
          </div>
        ) : (
          completedJobs.map((job) => (
            <div key={job.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {job.fileName}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe2 className="h-4 w-4" />
                          {job.sourceLanguage.toUpperCase()} → {job.targetLanguage.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowDownToLine className="h-4 w-4" />
                          {formatFileSize(job.translatedSize)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {job.translatedUrl && (
                  <a
                    href={job.translatedUrl}
                    download={`translated_${job.fileName}`}
                    className="ml-4 flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}