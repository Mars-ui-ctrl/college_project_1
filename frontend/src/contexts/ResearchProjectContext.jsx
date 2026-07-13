import React, { createContext, useState, useEffect, useContext } from 'react';
import projectService from '../services/projectService';
import paperService from '../services/paperService';
import noteService from '../services/noteService';
import { useAuth } from './AuthContext';

const ResearchProjectContext = createContext(null);

export const ResearchProjectProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [papers, setPapers] = useState([]);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [openPaperTabs, setOpenPaperTabs] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all projects on mount if authenticated
  const loadProjects = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await projectService.getProjects();
      setProjects(res.data.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setPapers([]);
      setCurrentPaper(null);
      setOpenPaperTabs([]);
      setNotes([]);
    }
  }, [isAuthenticated]);

  const selectProject = async (projectId) => {
    try {
      setLoading(true);
      const res = await projectService.getProject(projectId);
      setCurrentProject(res.data.project);
      setPapers(res.data.project.papers || []);
      
      // Load notes associated with project
      const notesRes = await noteService.getNotes(projectId);
      setNotes(notesRes.data.notes || []);

      // Reset PDF tabs for fresh workspace
      setOpenPaperTabs([]);
      setCurrentPaper(null);
    } catch (err) {
      console.error(`Failed to select project ${projectId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async (title, description) => {
    try {
      setLoading(true);
      const res = await projectService.createProject({ title, description });
      const newProj = res.data.project;
      setProjects((prev) => [newProj, ...prev]);
      await selectProject(newProj._id);
      return newProj;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProject = async (projectId) => {
    try {
      setLoading(true);
      await projectService.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      if (currentProject?._id === projectId) {
        setCurrentProject(null);
        setPapers([]);
        setNotes([]);
        setCurrentPaper(null);
        setOpenPaperTabs([]);
      }
    } catch (err) {
      console.error(`Failed to delete project ${projectId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPaperToProject = async (file) => {
    if (!currentProject) return;
    try {
      setLoading(true);
      const res = await paperService.uploadPaper(currentProject._id, file);
      const newPaper = res.data.paper;
      setPapers((prev) => [newPaper, ...prev]);
      
      // Auto-open uploaded paper in workspace
      openPaperInWorkspace(newPaper);
      return newPaper;
    } catch (err) {
      console.error('Paper upload failure:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePaperFromProject = async (paperId) => {
    try {
      setLoading(true);
      await paperService.deletePaper(paperId);
      setPapers((prev) => prev.filter((p) => p._id !== paperId));
      closePaperTab(paperId);
    } catch (err) {
      console.error('Paper delete failure:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openPaperInWorkspace = (paper) => {
    if (!paper) return;
    // Add tab if not already present
    setOpenPaperTabs((prev) => {
      const exists = prev.some((p) => p._id === paper._id);
      if (!exists) {
        return [...prev, paper];
      }
      return prev;
    });
    setCurrentPaper(paper);
  };

  const closePaperTab = (paperId) => {
    setOpenPaperTabs((prev) => {
      const updated = prev.filter((p) => p._id !== paperId);
      
      // If we closed the active tab, find another tab to make active
      if (currentPaper?._id === paperId) {
        if (updated.length > 0) {
          setCurrentPaper(updated[updated.length - 1]);
        } else {
          setCurrentPaper(null);
        }
      }
      return updated;
    });
  };

  const loadNotes = async () => {
    if (!currentProject) return;
    try {
      const res = await noteService.getNotes(currentProject._id);
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error('Failed to reload notes:', err);
    }
  };

  const addNote = async (noteData) => {
    if (!currentProject) return;
    try {
      const res = await noteService.createNote({
        projectId: currentProject._id,
        ...noteData,
      });
      setNotes((prev) => [res.data.note, ...prev]);
      return res.data.note;
    } catch (err) {
      console.error('Failed to create note:', err);
      throw err;
    }
  };

  const editNote = async (id, noteData) => {
    try {
      const res = await noteService.updateNote(id, noteData);
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data.note : n)));
      return res.data.note;
    } catch (err) {
      console.error(`Failed to update note ${id}:`, err);
      throw err;
    }
  };

  const removeNote = async (id) => {
    try {
      await noteService.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(`Failed to delete note ${id}:`, err);
      throw err;
    }
  };

  return (
    <ResearchProjectContext.Provider
      value={{
        projects,
        currentProject,
        papers,
        currentPaper,
        openPaperTabs,
        notes,
        loading,
        loadProjects,
        selectProject,
        createNewProject,
        removeProject,
        addPaperToProject,
        removePaperFromProject,
        openPaperInWorkspace,
        closePaperTab,
        loadNotes,
        addNote,
        editNote,
        removeNote,
      }}
    >
      {children}
    </ResearchProjectContext.Provider>
  );
};

export const useResearchProject = () => {
  const context = useContext(ResearchProjectContext);
  if (!context) {
    throw new Error('useResearchProject must be used inside a ResearchProjectProvider');
  }
  return context;
};

export default ResearchProjectContext;
