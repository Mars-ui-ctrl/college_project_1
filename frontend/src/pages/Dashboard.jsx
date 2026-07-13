import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import analyticsService from '../services/analyticsService';
import {
  Flame,
  Plus,
  ArrowRight,
  BookOpen,
  Trophy,
  Activity,
  CheckSquare,
  Search,
  Sparkles,
  Award,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, selectProject, createNewProject } = useResearchProject();

  const [stats, setStats] = useState({
    streak: 0,
    readingProgress: 0,
    papersAnalysed: 0,
    hoursSaved: 0,
    minutesInvested: 0,
    flashcardsReviewed: 0,
    quizAccuracy: 0,
    knowledgeScore: 0,
    heatmap: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([
    { id: 1, text: 'Upload latest research PDF', done: false },
    { id: 2, text: 'Generate AI Summary for review', done: false },
    { id: 3, text: 'Attempt Quiz at medium difficulty', done: false },
    { id: 4, text: 'Review Spaced Repetition flashcards', done: false },
  ]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDashboard();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Generate 52 weeks x 7 days grid blocks representing calendar heatmap
  const renderHeatmap = () => {
    // Generate dummy active dates if empty to populate the UI beautifully, otherwise map real counts
    const today = new Date();
    const days = [];
    const heatmapMap = new Map(stats.heatmap?.map((item) => [item.date, item.count]));

    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = heatmapMap.get(dateStr) || 0;
      days.push({ date: dateStr, count });
    }

    return (
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
        {days.map((day, index) => {
          let bgColor = 'bg-slate-800/40';
          if (day.count > 0 && day.count < 3) bgColor = 'bg-brand-primary/30';
          if (day.count >= 3 && day.count < 6) bgColor = 'bg-brand-primary/60';
          if (day.count >= 6) bgColor = 'bg-brand-secondary';

          return (
            <div
              key={index}
              title={`${day.date}: ${day.count} activities`}
              className={`h-3 w-3 rounded-[2px] transition-all cursor-pointer hover:scale-125 ${bgColor}`}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative glass-panel p-6 rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-[40%] h-[120%] bg-gradient-to-l from-brand-primary/10 to-transparent pointer-events-none z-0"></div>
        
        <div className="relative z-10 space-y-1">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white m-0 tracking-tight">
            Welcome, {user?.username?.toLowerCase().includes('master') ? user.username : `Master ${user?.username}`}!
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Analyze your papers, test your comprehension, and expand your research journey.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="font-heading font-bold text-lg text-white">{stats.streak} Days</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Streak</div>
          </div>
        </div>
      </div>

      {/* Grid of Key Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Papers Analyzed', value: stats.papersAnalysed, icon: BookOpen, color: 'text-brand-primary bg-brand-primary/10' },
          { label: 'Hours Saved', value: `${stats.hoursSaved} hrs`, icon: Trophy, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Quiz Accuracy', value: `${stats.quizAccuracy}%`, icon: Award, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Knowledge Score', value: stats.knowledgeScore, icon: Activity, color: 'text-brand-secondary bg-brand-secondary/10' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-xs font-semibold">{card.label}</div>
                <div className="font-heading font-bold text-2xl text-white mt-1">{card.value}</div>
              </div>
              <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${card.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left Column (Heatmap, AI recommendations, Recents), Right Column (Focus, Quick stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Heatmap Section */}
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="font-heading font-bold text-sm text-slate-300 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-brand-primary" /> Research Journey Timeline
            </h3>
            {renderHeatmap()}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wide">
              <span>90 Days Ago</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="h-2 w-2 rounded-[2px] bg-slate-800/40"></div>
                <div className="h-2 w-2 rounded-[2px] bg-brand-primary/30"></div>
                <div className="h-2 w-2 rounded-[2px] bg-brand-primary/60"></div>
                <div className="h-2 w-2 rounded-[2px] bg-brand-secondary"></div>
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-slate-300 flex items-center gap-2 m-0">
                <Sparkles size={16} className="text-brand-secondary" /> AI Recommended Topics
              </h3>
              <span className="text-[10px] uppercase font-extrabold text-brand-secondary tracking-widest bg-brand-secondary/15 px-2 py-0.5 rounded-full">Gemini Tailored</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {[
                { title: 'Generative AI Prompt Tuning', desc: 'Optimize context-window payloads for faster reasoning speeds.', tags: ['NLP', 'AI Efficiency'] },
                { title: 'Graph RAG Architectures', desc: 'Connect node-link vector databases for comprehensive Q&A mapping.', tags: ['RAG', 'Knowledge Graph'] },
              ].map((rec, i) => (
                <div key={i} className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl hover:border-brand-primary/40 transition-all cursor-pointer">
                  <h4 className="font-heading font-bold text-xs text-white m-0">{rec.title}</h4>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">{rec.desc}</p>
                  <div className="flex gap-1.5 mt-3">
                    {rec.tags.map((t, idx) => (
                      <span key={idx} className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Today's Focus checklist */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-300 m-0 flex items-center gap-2">
              <CheckSquare size={16} className="text-brand-secondary" /> Today's Focus
            </h3>
            <div className="space-y-2.5">
              {todos.map((todo) => (
                <button
                  key={todo.id}
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center gap-3 w-full text-left p-2.5 rounded-xl bg-slate-900/30 border border-slate-800/40 hover:bg-slate-900/60 transition-all"
                >
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                      todo.done ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-700'
                    }`}
                  >
                    {todo.done && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`text-xs font-semibold ${todo.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {todo.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Projects List */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-300 m-0">Recent Projects</h3>
            <div className="space-y-2.5">
              {projects.slice(0, 3).map((p) => (
                <button
                  key={p._id}
                  onClick={() => selectProject(p._id)}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-900/30 border border-slate-800/40 hover:border-brand-primary/20 transition-all group"
                >
                  <div className="text-left max-w-[80%]">
                    <div className="font-heading font-bold text-xs text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{p.description || 'No description'}</div>
                  </div>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-brand-primary transition-all group-hover:translate-x-1" />
                </button>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-medium">Create a workspace to start!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
