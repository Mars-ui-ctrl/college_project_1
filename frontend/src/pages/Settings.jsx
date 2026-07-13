import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import { Settings as SettingsIcon, Bell, Eye, Globe, ShieldAlert, Check } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const Settings = () => {
  const { user } = useAuth();
  const { currentProject } = useResearchProject();
  const { showAlert } = useModal();

  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('purple');
  const [lang, setLang] = useState('en');
  const [notifications, setNotifications] = useState({
    aiComplete: true,
    weeklyReports: false,
    quizReminders: true,
  });

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const accents = [
    { name: 'purple', class: 'bg-purple-600' },
    { name: 'cyan', class: 'bg-cyan-500' },
    { name: 'emerald', class: 'bg-emerald-500' },
    { name: 'orange', class: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl text-white m-0">Settings</h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage preferences and profile details</p>
        </div>
      </div>

      {/* Theme preferences */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-300 m-0 flex items-center gap-2">
          <Eye size={16} className="text-brand-primary" /> Appearance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              theme === 'dark'
                ? 'bg-slate-900 border-brand-primary text-white'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold">Dark Mode</div>
            <div className="text-[10px] text-slate-500 mt-1">Default premium experience</div>
            {theme === 'dark' && (
              <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs">✓</span>
            )}
          </button>

          <button
            onClick={async () => {
              setTheme('light');
              await showAlert('Light mode is coming soon in the next update! Currently restricted to premium dark UI.', 'Coming Soon');
              setTheme('dark');
            }}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-left opacity-60 cursor-not-allowed"
          >
            <div className="text-xs font-bold text-slate-500">Light Mode</div>
            <div className="text-[10px] text-slate-600 mt-1">Sleek workspace daylight</div>
          </button>
        </div>

        {/* Accent Selector */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-400 mb-2">INTERFACE ACCENT</label>
          <div className="flex gap-3">
            {accents.map((acc) => (
              <button
                key={acc.name}
                onClick={() => setAccent(acc.name)}
                className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  accent === acc.name ? 'border-white scale-110' : 'border-transparent opacity-80 hover:opacity-100'
                } ${acc.class}`}
              >
                {accent === acc.name && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-300 m-0 flex items-center gap-2">
          <Bell size={16} className="text-brand-secondary" /> Notification Alerts
        </h3>
        <div className="space-y-3">
          {[
            { key: 'aiComplete', label: 'AI summary extraction complete', desc: 'Alert when uploaded paper processing completes.' },
            { key: 'quizReminders', label: 'Spaced repetition alerts', desc: 'Alert when flashcards or quizzes are due for review.' },
            { key: 'weeklyReports', label: 'Weekly activity report digests', desc: 'A summary of study metrics delivered weekly.' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/20 border border-slate-800/40">
              <div className="max-w-[80%]">
                <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <button
                onClick={() => handleNotificationToggle(item.key)}
                className={`w-10 h-6 rounded-full transition-all relative ${
                  notifications[item.key] ? 'bg-brand-primary' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white absolute top-1 transition-all ${
                    notifications[item.key] ? 'right-1' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-300 m-0 flex items-center gap-2">
          <Globe size={16} className="text-amber-500" /> Language & Regional
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">PREFERRED LANGUAGE</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-primary"
          >
            <option value="en">English (US)</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
