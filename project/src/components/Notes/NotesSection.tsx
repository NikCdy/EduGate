import React, { useState, useEffect } from 'react';
import { Bookmark, Edit, Trash2, X, Save, Plus, FileText, Clock } from 'lucide-react';
import axios from 'axios';

interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const NotesSection: React.FC = () => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const signedInStatus = localStorage.getItem('isSignedIn') === 'true';
    setIsSignedIn(signedInStatus);
    
    if (signedInStatus) {
      fetchNotes();
    } else {
      // Load from localStorage for non-signed in users
      const savedNote = localStorage.getItem('user_note');
      if (savedNote) {
        const localNote: Note = {
          _id: 'local',
          title: 'Quick Note',
          content: savedNote,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setNotes([localNote]);
        setActiveNote(localNote);
      }
    }
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
        if (notesWithContent.length > 0) {
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
      
      if (isSignedIn && userId) {
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
      } else {
        // Save to localStorage for non-signed in users
        localStorage.setItem('user_note', editContent);
        const localNote: Note = {
          _id: 'local',
          title: editTitle || 'Quick Note',
          content: editContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setNotes([localNote]);
        setActiveNote(localNote);
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
      if (isSignedIn && noteId !== 'local') {
        await axios.delete(`${API_URL}/notes.php`, {
          data: { id: noteId }
        });
      } else {
        localStorage.removeItem('user_note');
      }
      
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



  return (
    <div
      className={`fixed bottom-5 right-5 z-50 rounded-xl shadow-xl border transition-all duration-300 ${
        showNotes ? 'w-96 h-96' : 'w-40 h-12'
      }`}
      style={{
        backgroundColor: 'white',
        borderColor: '#3b82f6',
      }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-xl">
        <span className="font-semibold flex items-center">
          <Bookmark className="w-4 h-4 mr-2" />
          <span>My Notes</span>
        </span>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-white hover:bg-blue-700 rounded-full p-1"
        >
          {showNotes ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Notes Content */}
      {showNotes && (
        <div className="flex h-[calc(100%-48px)]">
          {/* Notes List Sidebar */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={createNewNote}
                className="w-full py-2 px-3 bg-blue-50 text-blue-600 rounded flex items-center justify-center hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 mr-1" /> New Note
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading...
                </div>
              ) : notes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notes yet
                </div>
              ) : (
                notes.map(note => (
                  <div
                    key={note._id}
                    className={`p-2 cursor-pointer hover:bg-gray-50 ${
                      activeNote?._id === note._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setActiveNote(note)}
                  >
                    <div className="font-medium text-sm truncate">{note.title}</div>
                    <div className="text-xs text-gray-500 truncate">{note.content.substring(0, 30)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Note Content Area */}
          <div className="w-2/3 flex flex-col">
            {isEditing ? (
              <div className="flex flex-col h-full p-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title"
                  className="w-full p-2 border border-gray-200 rounded mb-2 text-sm"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="flex-grow w-full p-2 border border-gray-200 rounded text-sm resize-none"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNote}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-3 h-3 mr-1" /> Save
                  </button>
                </div>
              </div>
            ) : activeNote ? (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{activeNote.title}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={editCurrentNote}
                        className="p-1 text-gray-500 hover:text-blue-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(activeNote._id)}
                        className="p-1 text-gray-500 hover:text-red-600 rounded"
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
                <div className="p-3 overflow-y-auto flex-grow">
                  <p className="text-sm whitespace-pre-wrap">{activeNote.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-12 h-12 mb-2 text-gray-300" />
                <p>Select a note or create a new one</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;