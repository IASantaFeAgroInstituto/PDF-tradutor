import React, { useState } from 'react';
import { LanguageSelector } from '../translation/LanguageSelector';
import { KnowledgeBase } from '../../types';

interface KnowledgeBaseFormProps {
  onSubmit: (kb: Omit<KnowledgeBase, 'id' | 'entries' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function KnowledgeBaseForm({ onSubmit, onCancel }: KnowledgeBaseFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      sourceLanguage,
      targetLanguage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Technical Documentation Glossary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Brief description of this knowledge base..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LanguageSelector
          label="Source Language"
          value={sourceLanguage}
          onChange={setSourceLanguage}
        />
        <LanguageSelector
          label="Target Language"
          value={targetLanguage}
          onChange={setTargetLanguage}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Knowledge Base
        </button>
      </div>
    </form>
  );
}