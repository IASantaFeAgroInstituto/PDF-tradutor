import React from 'react';
import { Book, Plus, Search } from 'lucide-react';
import { KnowledgeBase } from '../../types';

interface KnowledgeBaseListProps {
  knowledgeBases: KnowledgeBase[];
  onSelect: (kb: KnowledgeBase) => void;
  onCreateNew: () => void;
}

export function KnowledgeBaseList({ knowledgeBases, onSelect, onCreateNew }: KnowledgeBaseListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Knowledge Bases</h2>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Knowledge Base
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search knowledge bases..."
          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {knowledgeBases.map((kb) => (
          <button
            key={kb.id}
            onClick={() => onSelect(kb)}
            className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors text-left"
          >
            <Book className="h-6 w-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{kb.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{kb.description}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>{kb.entries.length} entries</span>
                <span>{kb.sourceLanguage} → {kb.targetLanguage}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}