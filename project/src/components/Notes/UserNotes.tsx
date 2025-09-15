import React, { useState, useEffect } from 'react';
import { Bookmark, Edit, Trash2, Save, Plus, FileText, Clock, Search } from 'lucide-react';
import axios from 'axios';

interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const UserNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await axios.get(`${API_URL}/notes.php?userId=${userId}`);
      if (response.data.success) {
        const notesWithContent = await Promise.all(
          response.data.notes.map(async (note) => {
            if (note.contentFileId && !note.content) {
              try {
                const contentResponse = await axios.get(`${API_URL}/note_content/${note._id}`);
                if (contentResponse.data.success) {
                  return { ...note, content: contentResponse.data.content };
                }
              } catch (err) {
                console.error('Error fetching note content:', err);
              }
            }
            return note;
          })
        );
        
        setNotes(notesWithContent);
        if (notesWithContent.length > 0 && !activeNote) {
          setActiveNote(notesWithContent[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async () => {
    if (!editTitle.trim() && !editContent.trim()) {
      alert('Please enter a title or content for the note.');
      return;
    }
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Please sign in to save notes.');
        return;
      }
      
      if (activeNote && activeNote._id !== 'local') {
        // Update existing note
        const response = await axios.put(`${API_URL}/notes.php`, {
          id: activeNote._id,
          title: editTitle || 'Untitled Note',
          content: editContent
        });
        
        if (response.data.success) {
          // Update local state
          const updatedNote = {
            ...activeNote,
            title: editTitle || 'Untitled Note',
            content: editContent,
            updated_at: new Date().toISOString()
          };
          
          setNotes(notes.map(note => 
            note._id === activeNote._id ? updatedNote : note
          ));
          setActiveNote(updatedNote);
        } else {
          alert('Failed to save note: ' + (response.data.message || 'Unknown error'));
          return;
        }
      } else {
        // Create new note
        const response = await axios.post(`${API_URL}/notes.php`, {
          userId,
          title: editTitle || 'Untitled Note',
          content: editContent
        });
        
        if (response.data.success) {
          const newNote = {
            ...response.data.note,
            content: editContent // Ensure content is set
          };
          setNotes([newNote, ...notes]);
          setActiveNote(newNote);
        } else {
          alert('Failed to create note: ' + (response.data.message || 'Unknown error'));
          return;
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`${API_URL}/notes.php`, {
        data: { id: noteId }
      });
      
      const updatedNotes = notes.filter(note => note._id !== noteId);
      setNotes(updatedNotes);
      
      if (activeNote?._id === noteId) {
        setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const createNewNote = () => {
    setEditTitle('');
    setEditContent('');
    setActiveNote(null);
    setIsEditing(true);
  };

  const editCurrentNote = () => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setIsEditing(true);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown date';
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Bookmark className="w-6 h-6 mr-2 text-blue-600" />
        My Notes
      </h2>
      
      <div className="flex h-[500px] border border-gray-200 rounded-lg overflow-hidden">
        {/* Notes List Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={createNewNote}
              className="w-full py-2 px-3 bg-blue-50 text-blue-600 rounded flex items-center justify-center hover:bg-blue-100"
            >
              <Plus className="w-4 h-4 mr-1" /> New Note
            </button>
          </div>
          
          <div className="overflow-y-auto flex-grow divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note._id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    activeNote?._id === note._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setActiveNote(note)}
                >
                  <div className="font-medium text-sm truncate">{note.title}</div>
                  <div className="text-xs text-gray-500 truncate">{note.content.substring(0, 50)}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(note.updated_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Content Area */}
        <div className="w-2/3 flex flex-col">
          {isEditing ? (
            <div className="flex flex-col h-full p-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Note title"
                className="w-full p-2 border border-gray-200 rounded mb-3 text-lg font-medium"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your note here..."
                className="flex-grow w-full p-3 border border-gray-200 rounded text-sm resize-none"
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-1" /> Save
                </button>
              </div>
            </div>
          ) : activeNote ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">{activeNote.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={editCurrentNote}
                      className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(activeNote._id)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(activeNote.updated_at)}
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-grow">
                <p className="text-sm whitespace-pre-wrap">{activeNote.content}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-3 text-gray-300" />
              <p className="text-lg">Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNotes;