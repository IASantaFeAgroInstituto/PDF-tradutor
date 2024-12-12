import React, { useState } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { FileUpload } from './components/upload/FileUpload';
import { LanguageSelector } from './components/translation/LanguageSelector';
import { TranslationProgress } from './components/translation/TranslationProgress';
import { TranslatedDocuments } from './components/translation/TranslatedDocuments';
import { KnowledgeBaseList } from './components/knowledge/KnowledgeBaseList';
import { GlossaryEditor } from './components/knowledge/GlossaryEditor';
import { KnowledgeBaseForm } from './components/knowledge/KnowledgeBaseForm';
import { TranslationJob, AuthState, KnowledgeBase } from './types';
import { FileText, Book } from 'lucide-react';

function App() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [showNewKbForm, setShowNewKbForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'translated' | 'knowledge'>('upload');

  const handleLogin = (email: string, password: string) => {
    setAuth({
      user: { id: '1', email, name: email.split('@')[0] },
      isAuthenticated: true,
    });
  };

  const handleFileSelect = (files: File[]) => {
    const newJobs: TranslationJob[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      sourceLanguage,
      targetLanguage,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      originalSize: file.size,
    }));

    setJobs((prev) => [...prev, ...newJobs]);
  };

  const handleCreateKnowledgeBase = (kb: Omit<KnowledgeBase, 'id' | 'entries' | 'createdAt' | 'updatedAt'>) => {
    const newKb: KnowledgeBase = {
      ...kb,
      id: Math.random().toString(36).substr(2, 9),
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setKnowledgeBases([...knowledgeBases, newKb]);
    setShowNewKbForm(false);
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            PDF Translation System
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">PDF Translation</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{auth.user?.email}</span>
              <button
                onClick={() => setAuth({ user: null, isAuthenticated: false })}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upload Documents
            </button>
            <button
              onClick={() => setActiveTab('translated')}
              className={`${
                activeTab === 'translated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Translated Documents
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`${
                activeTab === 'knowledge'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Knowledge Base
            </button>
          </nav>
        </div>

        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Upload Documents</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                <FileUpload onFileSelect={handleFileSelect} />
              </div>

              {jobs.filter(job => job.status !== 'completed').length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Translation Jobs</h2>
                  <div className="space-y-4">
                    {jobs
                      .filter(job => job.status !== 'completed')
                      .map((job) => (
                        <TranslationProgress key={job.id} job={job} />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'translated' && (
            <div className="bg-white shadow rounded-lg p-6">
              <TranslatedDocuments jobs={jobs} />
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="bg-white shadow rounded-lg p-6">
              {showNewKbForm ? (
                <KnowledgeBaseForm
                  onSubmit={handleCreateKnowledgeBase}
                  onCancel={() => setShowNewKbForm(false)}
                />
              ) : selectedKnowledgeBase ? (
                <GlossaryEditor
                  knowledgeBase={selectedKnowledgeBase}
                  onSave={(entries) => {
                    setKnowledgeBases(knowledgeBases.map(kb =>
                      kb.id === selectedKnowledgeBase.id
                        ? { ...kb, entries, updatedAt: new Date() }
                        : kb
                    ));
                    setSelectedKnowledgeBase(null);
                  }}
                />
              ) : (
                <KnowledgeBaseList
                  knowledgeBases={knowledgeBases}
                  onSelect={setSelectedKnowledgeBase}
                  onCreateNew={() => setShowNewKbForm(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;