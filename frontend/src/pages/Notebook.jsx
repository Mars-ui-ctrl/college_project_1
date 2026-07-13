import React, { useState, useEffect, useRef } from 'react';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import { downloadNoteExport } from '../services/noteService';
import { useModal } from '../contexts/ModalContext';
import {
  StickyNote as StickyIcon,
  FileText,
  Mic,
  Square,
  Plus,
  Trash2,
  Download,
  Eye,
  Edit2,
  FileDown,
  Loader,
  Play,
  Volume2,
} from 'lucide-react';

const Notebook = () => {
  const { currentProject, notes, addNote, editNote, removeNote } = useResearchProject();
  const { showAlert, showConfirm } = useModal();

  const [activeTab, setActiveTab] = useState('markdown'); // 'markdown' | 'stickies' | 'voice'
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Local state and timeout references for lag-free sticky note typing
  const [localStickyContents, setLocalStickyContents] = useState({});
  const stickySaveTimeouts = useRef({});

  // Clear pending database saves on component unmount
  useEffect(() => {
    return () => {
      Object.values(stickySaveTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // Voice recording states
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Sticky drag states
  const [draggedSticky, setDraggedSticky] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Sync editor fields on selected note change
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    } else {
      setEditTitle('');
      setEditContent('');
    }
  }, [selectedNote]);

  // Filter notes by type
  const markdownNotes = notes.filter((n) => n.type === 'markdown');
  const stickyNotes = notes.filter((n) => n.type === 'sticky');
  const voiceNotes = notes.filter((n) => n.type === 'voice');

  // --- STICKIES LOGIC ---
  const handleAddSticky = async () => {
    const colors = ['#fffb8f', '#ffccc7', '#d9f7be', '#bae7ff', '#efdbff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    await addNote({
      title: 'Sticky Note',
      content: '',
      type: 'sticky',
      color: randomColor,
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
    });
  };

  const handleStickyMouseDown = (e, note) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
    setDraggedSticky(note);
    dragStartPos.current = {
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y,
    };
  };

  const handleStickyMouseMove = (e) => {
    if (!draggedSticky) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    
    // Update local visual position instantly for smooth dragging
    setDraggedSticky((prev) => ({
      ...prev,
      position: { x: newX, y: newY },
    }));
  };

  const handleStickyMouseUp = async () => {
    if (!draggedSticky) return;
    const noteId = draggedSticky._id;
    const newPos = draggedSticky.position;
    
    setDraggedSticky(null);
    try {
      await editNote(noteId, { position: newPos });
    } catch (err) {
      console.error('Failed to save sticky position:', err);
    }
  };

  const handleStickyTextChange = (id, text) => {
    // 1. Update local state instantly for responsive typing
    setLocalStickyContents((prev) => ({
      ...prev,
      [id]: text,
    }));

    // 2. Clear any existing timeout for this specific sticky note
    if (stickySaveTimeouts.current[id]) {
      clearTimeout(stickySaveTimeouts.current[id]);
    }

    // 3. Queue the database autosave API call with a 600ms debounce
    stickySaveTimeouts.current[id] = setTimeout(async () => {
      try {
        await editNote(id, { content: text });
      } catch (err) {
        console.error('Failed to autosave sticky text:', err);
      }
      delete stickySaveTimeouts.current[id];
    }, 600);
  };

  // --- MARKDOWN NOTES LOGIC ---
  const handleAddMarkdownNote = async () => {
    const note = await addNote({
      title: 'Untitled Note',
      content: '',
      type: 'markdown',
    });
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleSaveMarkdownNote = async () => {
    if (!selectedNote) return;
    try {
      const updated = await editNote(selectedNote._id, {
        title: editTitle,
        content: editContent,
      });
      setSelectedNote(updated);
      setIsEditing(false);
    } catch (err) {
      await showAlert('Failed to save document note.', 'Save Error');
    }
  };

  const handleDownloadNote = async (format) => {
    if (!selectedNote) return;
    try {
      const filename = `${selectedNote.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${format}`;
      await downloadNoteExport(selectedNote._id, format, filename);
    } catch (err) {
      await showAlert('Failed to download note report.', 'Export Error');
    }
  };

  // --- VOICE RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());

        // Auto save recording as a note
        try {
          const dateStr = new Date().toLocaleString();
          await addNote({
            title: `Voice Memo - ${dateStr}`,
            content: 'Spoken transcription memo recorded successfully.',
            type: 'voice',
            voiceUrl: window.URL.createObjectURL(blob), // Local object URL for playbacks
          });
        } catch (err) {
          console.error('Failed to save voice note:', err);
        }
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      await showAlert('Microphone access denied or audio device not found.', 'Permission Error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col min-h-0">
      {/* Workspace Warning */}
      {!currentProject ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel rounded-2xl border border-slate-800">
          <FileText size={48} className="text-slate-600 mb-3" />
          <h2 className="font-heading font-bold text-white text-lg m-0">No Workspace Selected</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            Select or create a workspace using the dropdown above to open your research notebook.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs bar */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
              {[
                { id: 'markdown', label: 'Notes Notebook', icon: FileText },
                { id: 'stickies', label: 'Draggable Canvas', icon: StickyIcon },
                { id: 'voice', label: 'Voice Notes', icon: Mic },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedNote(null);
                      setIsEditing(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand-primary text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            {activeTab === 'markdown' && (
              <button
                onClick={handleAddMarkdownNote}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/25 rounded-xl text-xs font-bold transition-all"
              >
                <Plus size={14} /> New Note
              </button>
            )}
            {activeTab === 'stickies' && (
              <button
                onClick={handleAddSticky}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/25 rounded-xl text-xs font-bold transition-all"
              >
                <Plus size={14} /> Add Sticky
              </button>
            )}
          </div>

          {/* Tab Views Content */}
          <div className="flex-1 min-h-0">
            {/* VIEW 1: MARKDOWN NOTEBOOK */}
            {activeTab === 'markdown' && (
              <div className="h-full flex gap-6">
                {/* Notes List */}
                <div className="w-64 glass-panel border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0">
                  <div className="p-3 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    All Documents
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {markdownNotes.map((note) => (
                      <button
                        key={note._id}
                        onClick={() => {
                          setSelectedNote(note);
                          setIsEditing(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all block ${
                          selectedNote?._id === note._id
                            ? 'bg-brand-primary/10 border-l-2 border-brand-primary text-slate-100 font-bold'
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs truncate">{note.title}</div>
                        <div className="text-[9px] text-slate-500 mt-1">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                    {markdownNotes.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-600 font-medium">No notes created yet</div>
                    )}
                  </div>
                </div>

                {/* Editor Panel */}
                <div className="flex-1 glass-panel border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
                  {selectedNote ? (
                    <>
                      {/* Editor Header controls */}
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-heading font-bold text-xs text-white focus:outline-none"
                          />
                        ) : (
                          <h3 className="font-heading font-bold text-sm text-slate-200 m-0">
                            {selectedNote.title}
                          </h3>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200"
                            title={previewMode ? 'Edit Mode' : 'Preview Mode'}
                          >
                            {previewMode ? <Edit2 size={14} /> : <Eye size={14} />}
                          </button>
                          
                          {isEditing ? (
                            <button
                              onClick={handleSaveMarkdownNote}
                              className="px-3.5 py-1.5 bg-brand-primary text-white rounded-xl text-[10px] font-bold"
                            >
                              Save Note
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-3.5 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-[10px] font-bold"
                            >
                              Edit Note
                            </button>
                          )}

                          {/* Export dropdown */}
                          <div className="relative group">
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-200">
                              <FileDown size={14} /> Export
                            </button>
                            <div className="absolute right-0 mt-1 w-32 glass-panel border border-slate-800 rounded-xl shadow-lg hidden group-hover:block z-50 py-1.5 px-1.5 space-y-0.5">
                              {['md', 'json', 'pdf', 'docx'].map((fmt) => (
                                <button
                                  key={fmt}
                                  onClick={() => handleDownloadNote(fmt)}
                                  className="w-full text-left px-3 py-1 rounded text-[10px] text-slate-300 hover:bg-slate-800/60 uppercase font-bold"
                                >
                                  .{fmt}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={async () => {
                              const confirmed = await showConfirm('Are you sure you want to delete this note?', 'Delete Note');
                              if (confirmed) {
                                removeNote(selectedNote._id);
                                setSelectedNote(null);
                              }
                            }}
                            className="p-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 rounded-xl"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Text Edit space */}
                      <div className="flex-1 p-5 overflow-y-auto">
                        {previewMode ? (
                          <div className="prose prose-invert text-xs leading-relaxed max-w-none text-slate-300 whitespace-pre-wrap font-medium">
                            {editContent}
                          </div>
                        ) : (
                          <textarea
                            disabled={!isEditing}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-full bg-transparent border-0 resize-none focus:outline-none font-mono text-xs leading-relaxed text-slate-300 placeholder:text-slate-600"
                            placeholder="# Write your research findings in Markdown..."
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs font-semibold">
                      Select or create a document note from the list sidebar to read/write details.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: STICKIES CANVAS */}
            {activeTab === 'stickies' && (
              <div
                className="h-full w-full glass-panel border border-slate-800 rounded-2xl relative overflow-hidden bg-slate-950/20 select-none"
                onMouseMove={handleStickyMouseMove}
                onMouseUp={handleStickyMouseUp}
              >
                {/* Visual grid coordinates lines background */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>
                
                {/* Render stickies */}
                {(draggedSticky ? [...stickyNotes.filter((n) => n._id !== draggedSticky._id), draggedSticky] : stickyNotes).map((note) => (
                  <div
                    key={note._id}
                    onMouseDown={(e) => handleStickyMouseDown(e, note)}
                    className="absolute p-4 rounded-xl shadow-lg border w-48 min-h-36 flex flex-col justify-between"
                    style={{
                      left: note.position.x,
                      top: note.position.y,
                      backgroundColor: note.color,
                      borderColor: 'rgba(0,0,0,0.15)',
                      color: '#1e293b',
                      cursor: draggedSticky?._id === note._id ? 'grabbing' : 'grab',
                    }}
                  >
                    <textarea
                      value={
                        localStickyContents[note._id] !== undefined
                          ? localStickyContents[note._id]
                          : note.content
                      }
                      onChange={(e) => handleStickyTextChange(note._id, e.target.value)}
                      className="bg-transparent border-0 outline-none w-full flex-1 resize-none text-[11px] leading-relaxed font-bold placeholder:text-slate-600"
                      placeholder="Type a sticky reminder..."
                    />

                    <div className="flex justify-between items-center border-t border-black/10 pt-2 mt-2">
                      <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Autosaved</span>
                      <button
                        onClick={() => removeNote(note._id)}
                        className="p-1 rounded hover:bg-black/10 text-rose-700 hover:text-rose-900 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {stickyNotes.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-600 text-xs font-semibold">
                    No stickies pinned. Click "Add Sticky" above to add sticky cards to this canvas board!
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: VOICE MEMOS */}
            {activeTab === 'voice' && (
              <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recorder Control widget */}
                <div className="glass-panel border border-slate-800 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-300 m-0">Voice Dictaphone</h3>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Media logger</p>
                  </div>

                  <div className="py-6 flex flex-col items-center space-y-4">
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className={`h-20 w-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                        recording
                          ? 'bg-rose-600 hover:bg-rose-700 animate-pulse shadow-rose-600/20'
                          : 'bg-brand-primary hover:bg-brand-primary/95 shadow-brand-primary/20'
                      }`}
                    >
                      {recording ? <Square size={28} /> : <Mic size={28} />}
                    </button>
                    <span className="text-xs font-semibold text-slate-300">
                      {recording ? 'Recording Voice Audio...' : 'Click circle to start record'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-normal max-w-[200px] italic">
                    Requires microphone permissions. Recording generates an audio log card in your database list automatically.
                  </div>
                </div>

                {/* Voice notes list */}
                <div className="md:col-span-2 glass-panel border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
                  <div className="p-3.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Saved Voice Memos
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {voiceNotes.map((note) => (
                      <div
                        key={note._id}
                        className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-2xl flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-850 text-brand-secondary">
                            <Volume2 size={18} />
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-xs text-white leading-normal">{note.title}</h4>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* HTML5 audio playback */}
                          {note.voiceUrl && (
                            <audio src={note.voiceUrl} controls className="h-8 max-w-[140px] md:max-w-[200px]" />
                          )}
                          <button
                            onClick={() => removeNote(note._id)}
                            className="p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {voiceNotes.length === 0 && (
                      <div className="text-center py-12 text-xs text-slate-500 font-medium">
                        No voice notes recorded yet. Record one using the microphone widget!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notebook;
