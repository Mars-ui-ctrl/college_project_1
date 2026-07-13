import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import { downloadPaperExport } from '../services/paperService';
import { useModal } from '../contexts/ModalContext';
import {
  Upload,
  BookOpen,
  Trash2,
  FileText,
  Copy,
  Download,
  X,
  Plus,
  Loader,
  Check,
  CheckCircle,
} from 'lucide-react';

const Papers = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();
  const {
    currentProject,
    papers,
    addPaperToProject,
    removePaperFromProject,
    openPaperInWorkspace,
    loading: projectLoading,
  } = useResearchProject();

  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false);
  const [copiedType, setCopiedType] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!currentProject) {
      await showAlert('Please select or create a research workspace project first.', 'Workspace Required');
      return;
    }
    if (file.type !== 'application/pdf') {
      await showAlert('Only PDF documents are supported.', 'Unsupported File');
      return;
    }

    try {
      setUploadLoading(true);
      await addPaperToProject(file);
    } catch (err) {
      await showAlert(err.message || 'Failed to process and upload research paper.', 'Upload Error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeletePaper = async (e, id) => {
    e.stopPropagation();
    const confirmed = await showConfirm(
      'Are you sure you want to delete this paper? All generated quizzes and flashcards will be removed.',
      'Delete Publication'
    );
    if (!confirmed) {
      return;
    }
    try {
      await removePaperFromProject(id);
      if (selectedPaper?._id === id) {
        setSummaryDrawerOpen(false);
        setSelectedPaper(null);
      }
    } catch (err) {
      await showAlert('Failed to delete paper.', 'Error');
    }
  };

  const openSummaryDrawer = (paper) => {
    setSelectedPaper(paper);
    setSummaryDrawerOpen(true);
  };

  const handleCopyCitation = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(''), 2000);
  };

  const handleDownloadReport = async (format) => {
    if (!selectedPaper) return;
    try {
      const cleanTitle = selectedPaper.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filename = `${cleanTitle}_summary.${format === 'bib' ? 'bib' : format}`;
      await downloadPaperExport(selectedPaper._id, format, filename);
    } catch (err) {
      await showAlert('Failed to download report file.', 'Download Error');
    }
  };

  const handleReadPaper = (paper) => {
    openPaperInWorkspace(paper);
    navigate('/workspace');
  };

  return (
    <div className="space-y-6">
      {/* Workspace Warning */}
      {!currentProject && (
        <div className="p-6 text-center glass-panel rounded-2xl border border-slate-800">
          <FileText size={48} className="mx-auto text-slate-600 mb-3" />
          <h2 className="font-heading font-bold text-white text-lg m-0">No Workspace Selected</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Please click on the workspace switcher at the top to select or create a project workspace before managing papers.
          </p>
        </div>
      )}

      {currentProject && (
        <>
          {/* Main Top Grid: Drag/Drop Upload Area & Workspace Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <form
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                  dragActive
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}
              >
                <input
                  type="file"
                  id="pdf-upload"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploadLoading}
                />
                
                {uploadLoading ? (
                  <div className="space-y-2.5 flex flex-col items-center">
                    <Loader size={28} className="animate-spin text-brand-primary" />
                    <div className="font-heading font-bold text-xs text-white">Extracting & Summarizing...</div>
                    <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                      Reading PDF layout, extracting bibliography metadata, and generating the AI summary structure using Gemini.
                    </p>
                  </div>
                ) : (
                  <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center space-y-2.5">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400">
                      <Upload size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">Drag & drop your PDF report here, or </span>
                      <span className="text-xs font-bold text-brand-secondary hover:underline">browse files</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Supports standard academic PDFs up to 15MB</p>
                  </label>
                )}
              </form>
            </div>

            {/* Project Summary Stats widget */}
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-300 m-0">Project Assets</h3>
                <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wider font-semibold">Active workspace</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Title:</span>
                    <span className="text-slate-200 truncate max-w-[140px]">{currentProject.title}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Uploaded papers:</span>
                    <span className="text-brand-secondary font-bold">{papers.length}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/40 pt-4 mt-4">
                <button
                  onClick={() => navigate('/workspace')}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/30 rounded-xl text-xs font-bold text-slate-200 transition-all"
                >
                  <BookOpen size={14} /> Open Interactive Workspace
                </button>
              </div>
            </div>
          </div>

          {/* Papers Table/List Explorer */}
          <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-slate-300 m-0">Workspace Bibliography</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase">{papers.length} papers</span>
            </div>
            
            <div className="divide-y divide-slate-800/60">
              {papers.map((paper) => (
                <div
                  key={paper._id}
                  onClick={() => openSummaryDrawer(paper)}
                  className="p-4 flex items-center justify-between hover:bg-slate-900/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4 max-w-[70%]">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800/80 text-brand-primary group-hover:scale-105 transition-all">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-white group-hover:text-brand-secondary transition-all line-clamp-1">
                        {paper.title}
                      </h4>
                      <p className="text-slate-400 text-[10px] mt-0.5 truncate">
                        {paper.authors?.length > 0 ? paper.authors.join(', ') : 'Unknown Authors'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {paper.summary?.keywords?.slice(0, 4).map((kw, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadPaper(paper);
                      }}
                      className="px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg text-[10px] font-bold transition-all"
                    >
                      Read & Discuss
                    </button>
                    <button
                      onClick={(e) => handleDeletePaper(e, paper._id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 text-rose-400 hover:text-rose-300 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {papers.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                  No research papers uploaded in this workspace yet. Drag in a PDF report above!
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- SLIDEOUT SUMMARY & CITATION DRAWER --- */}
      {summaryDrawerOpen && selectedPaper && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          {/* Backdrop Close Click */}
          <div className="flex-1" onClick={() => setSummaryDrawerOpen(false)}></div>
          
          <div className="w-full max-w-2xl bg-[#0b0f19] border-l border-slate-800 h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-brand-primary" />
                <span className="font-heading font-bold text-sm text-white">Summary Drawer</span>
              </div>
              <button onClick={() => setSummaryDrawerOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Summary Panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title Section */}
              <div className="space-y-1">
                <h2 className="font-heading font-extrabold text-lg text-white leading-normal m-0">{selectedPaper.title}</h2>
                <p className="text-slate-400 text-xs font-medium">{selectedPaper.authors?.join(', ')}</p>
                {selectedPaper.doi && (
                  <div className="text-[10px] font-mono text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800 w-max mt-2">
                    DOI: {selectedPaper.doi}
                  </div>
                )}
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-secondary m-0">Abstract</h3>
                <p className="text-slate-300 text-xs leading-relaxed font-medium">{selectedPaper.abstract}</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-xl">
                  <h4 className="font-heading font-bold text-xs text-white m-0">Research Methodology</h4>
                  <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{selectedPaper.summary?.methodology}</p>
                </div>
                <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-xl">
                  <h4 className="font-heading font-bold text-xs text-white m-0">Core Results & Findings</h4>
                  <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{selectedPaper.summary?.results}</p>
                </div>
                <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-xl">
                  <h4 className="font-heading font-bold text-xs text-white m-0">Limitations</h4>
                  <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{selectedPaper.summary?.limitations}</p>
                </div>
                <div className="p-4 bg-slate-900/40 border border-slate-800/40 rounded-xl">
                  <h4 className="font-heading font-bold text-xs text-white m-0">Future Work</h4>
                  <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{selectedPaper.summary?.futureWork}</p>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-secondary m-0">Extracted Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPaper.summary?.keywords?.map((kw, i) => (
                    <span key={i} className="text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-xl">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Citation Manager Section */}
              <div className="border-t border-slate-800/60 pt-6 space-y-4">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-primary m-0">Citations Manager</h3>
                
                <div className="space-y-3">
                  {[
                    { style: 'APA', text: selectedPaper.citations?.apa },
                    { style: 'MLA', text: selectedPaper.citations?.mla },
                    { style: 'IEEE', text: selectedPaper.citations?.ieee },
                  ].map((cite) => (
                    <div key={cite.style} className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl flex items-start justify-between gap-3 group">
                      <div className="text-left">
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">{cite.style} Style</span>
                        <p className="text-slate-300 text-xs mt-1 leading-normal font-medium">{cite.text}</p>
                      </div>
                      <button
                        onClick={() => handleCopyCitation(cite.text, cite.style)}
                        className="h-8 w-8 flex items-center justify-center bg-slate-800/60 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all shrink-0"
                      >
                        {copiedType === cite.style ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exporter triggers */}
              <div className="border-t border-slate-800/60 pt-6 space-y-3">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-secondary m-0">Export Reports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: 'Markdown', format: 'md' },
                    { label: 'BibTeX Citation', format: 'bib' },
                    { label: 'JSON Dataset', format: 'json' },
                    { label: 'Word Document', format: 'docx' },
                  ].map((exp) => (
                    <button
                      key={exp.format}
                      onClick={() => handleDownloadReport(exp.format)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 border border-slate-800 hover:border-brand-primary/30 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all shadow"
                    >
                      <Download size={12} /> {exp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom sticky drawer action */}
            <div className="p-4 border-t border-slate-800/60 flex gap-3 bg-slate-900/20 shrink-0">
              <button
                onClick={() => handleReadPaper(selectedPaper)}
                className="flex-1 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all shadow-lg shadow-brand-primary/15 text-center"
              >
                Open in Reader Workspace
              </button>
              <button
                onClick={() => setSummaryDrawerOpen(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Papers;
