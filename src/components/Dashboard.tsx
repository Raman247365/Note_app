'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Note } from '../types';
import api from '../utils/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes');
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/notes', { title, content });
      setNotes([response.data, ...notes]);
      setTitle('');
      setContent('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome, {user?.name}!</h1>
              <p className="text-blue-100 text-sm sm:text-base">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Create Note Form */}
          <div className="bg-white rounded-2xl shadow-xl mb-8">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Create New Note
                </h3>
              </div>
              <form onSubmit={createNote} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter note title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    placeholder="Write your note here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Note'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Notes List */}
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Your Notes ({notes.length})
                </h3>
              </div>
            </div>
            {notes.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h4>
                <p className="text-gray-500">Create your first note above to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notes.map((note) => (
                  <div key={note._id} className="px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">
                          {note.title}
                        </h4>
                        <p className="text-gray-700 mb-4 leading-relaxed break-words">{note.content}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNote(note._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;