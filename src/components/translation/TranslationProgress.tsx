import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { TranslationJob } from '../../types';

// Initialize the WebSocket client
const socket = io('http://localhost:3000'); // Update for the WebSocket server URL

// Props interface
interface TranslationProgressProps {
  job: TranslationJob;
}

// Functional Component for displaying translation progress
export function TranslationProgress({ job }: TranslationProgressProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{job.fileName}</span>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(job.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{job.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Separate Real-Time Progress Component
export function RealTimeTranslationProgress() {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Listen to translation progress updates from the backend
    socket.on('translation-progress', (data: { progress: number }) => {
      setProgress(data.progress);
    });

    return () => {
      socket.off('translation-progress');
    };
  }, []);

  return (
    <div>
      <h3>Progresso da Tradução</h3>
      <progress value={progress} max="100"></progress>
      <p>{progress}% concluído</p>
    </div>
  );
}

export default RealTimeTranslationProgress;
