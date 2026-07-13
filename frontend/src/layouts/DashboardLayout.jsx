import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import { useModal } from '../contexts/ModalContext';
import {
  LayoutDashboard,
  BookOpen,
  Binary,
  Network,
  StickyNote,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Menu,
  X,
  Flame,
  Trophy,
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showAlert } = useModal();
  const {
    projects,
    currentProject,
    selectProject,
    createNewProject,
    loading,
  } = useResearchProject();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Workspace', href: '/workspace', icon: BookOpen },
    { name: 'Papers Library', href: '/papers', icon: BookOpen },
    { name: 'AI Research Lab', href: '/ai-lab', icon: Binary },
    { name: 'Knowledge Graph', href: '/knowledge-graph', icon: Network },
    { name: 'Notebook', href: '/notebook', icon: StickyNote },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setModalLoading(true);
      const newProj = await createNewProject(newTitle, newDesc);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      navigate('/workspace'); // redirect to active workspace
    } catch (err) {
      await showAlert('Failed to create project workspace.', 'Creation Error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleProjectSelect = (id) => {
    selectProject(id);
    setProjectDropdownOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800/60 shrink-0">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary p-0.5 shadow shadow-brand-primary/20">
              <span className="font-heading font-black text-sm text-white">RN</span>
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-wide">Research Nexus</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-primary/20 text-brand-primary border-l-2 border-brand-primary'
                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Account Section */}
        <div className="p-4 border-t border-slate-800/40">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* --- MOBILE NAV & DRAWER --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel border-b border-slate-800/40 z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary p-0.5">
            <span className="font-heading font-black text-xs text-white">RN</span>
          </div>
          <span className="font-heading font-bold text-sm tracking-wide text-white">Research Nexus</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-slate-400">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#0b0f19]/90 z-20 pt-20 px-6 flex flex-col justify-between pb-6">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-brand-primary/20 text-brand-primary' : 'text-slate-400'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-rose-400 bg-rose-500/5 hover:bg-rose-500/10"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE VIEWPORT --- */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/30 z-30 shrink-0">
          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/30 text-xs font-semibold hover:bg-slate-800/60 transition-all text-slate-200"
            >
              <span className="text-slate-400">Workspace:</span>
              <span className="text-brand-secondary truncate max-w-[140px]">
                {currentProject ? currentProject.title : 'Select Workspace'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {projectDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 glass-panel rounded-xl shadow-xl py-2 border border-slate-800 z-50">
                <div className="px-3 pb-1.5 mb-1.5 border-b border-slate-800/40 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Select Project
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5 px-1.5">
                  {projects.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => handleProjectSelect(p._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-all ${
                        currentProject?._id === p._id
                          ? 'bg-brand-primary/10 text-brand-primary font-bold'
                          : 'text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 font-medium">No workspaces yet</div>
                  )}
                </div>
                <div className="border-t border-slate-800/40 mt-1.5 pt-1.5 px-1.5">
                  <button
                    onClick={() => {
                      setProjectDropdownOpen(false);
                      setShowCreateModal(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-brand-primary/20 text-brand-primary rounded-lg text-xs font-bold hover:bg-brand-primary/30 transition-all"
                  >
                    <Plus size={14} /> New Workspace
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Streak & Icons */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold border border-amber-500/20 shadow-inner">
              <Flame size={14} className="animate-pulse" />
              <span>{user?.readingStreak || 0} Day Streak</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.avatar ? (
                <img src={user.avatar} className="h-8 w-8 rounded-full border border-slate-700 bg-slate-800 shadow" alt="avatar" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs border border-brand-primary/30 shadow">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="hidden sm:inline font-heading text-xs font-semibold text-slate-300">
                {user?.username || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* --- CREATE WORKSPACE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg text-white m-0">Create Research Workspace</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">WORKSPACE NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LLM Reasoning Research"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:border-brand-primary text-sm text-slate-100 placeholder:text-slate-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">DESCRIPTION</label>
                <textarea
                  placeholder="Focus areas, papers to digest, notes..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:border-brand-primary text-sm text-slate-100 placeholder:text-slate-600 transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !newTitle.trim()}
                  className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                >
                  {modalLoading ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
