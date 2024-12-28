import { useState } from 'react';
import { Plus, Save, Trash2, Upload, Download, AlertCircle } from 'lucide-react';
import { GlossaryEntry, KnowledgeBase } from '../../types';
import { GlossaryFileUpload } from './GlossaryFileUpload';

interface GlossaryEditorProps {
  knowledgeBase: KnowledgeBase;
  onSave: (entries: GlossaryEntry[]) => void;
}

export function GlossaryEditor({ knowledgeBase, onSave }: GlossaryEditorProps) {
  const [entries, setEntries] = useState<GlossaryEntry[]>(knowledgeBase.entries);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEntry = () => {
    const newEntry: GlossaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      sourceText: '',
      targetText: '',
      createdAt: new Date(),
    };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (id: string, updates: Partial<GlossaryEntry>) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleEntriesLoaded = (newEntries: GlossaryEntry[]) => {
    setEntries((prevEntries) => [...prevEntries, ...newEntries]);
    setShowFileUpload(false);
    setError(null);
  };

  const exportToCsv = () => {
    const csvContent = entries
      .map(entry => 
        [entry.sourceText, entry.targetText, entry.context || '', entry.category || '']
          .map(field => `"${field.replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${knowledgeBase.name}_glossary.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Edit Glossary</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Upload className="h-4 w-4" />
            Import from File
          </button>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            Export to CSV
          </button>
          <button
            onClick={addEntry}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
          <button
            onClick={() => onSave(entries)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {showFileUpload && (
        <GlossaryFileUpload
          onEntriesLoaded={handleEntriesLoaded}
          onError={setError}
        />
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div>
              <label htmlFor={`source-${entry.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Source Text ({knowledgeBase.sourceLanguage})
              </label>
              <input
                id={`source-${entry.id}`}
                type="text"
                value={entry.sourceText}
                onChange={(e) => updateEntry(entry.id, { sourceText: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`target-${entry.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Target Text ({knowledgeBase.targetLanguage})
              </label>
              <div className="flex gap-2">
                <input
                  id={`target-${entry.id}`}
                  type="text"
                  value={entry.targetText}
                  onChange={(e) => updateEntry(entry.id, { targetText: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                  aria-label="Remove entry"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
