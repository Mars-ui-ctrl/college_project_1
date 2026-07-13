import React, { useState } from 'react';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import aiService from '../services/aiService';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Trophy,
  Activity,
  AlertCircle,
  Loader,
} from 'lucide-react';

const AILab = () => {
  const { currentProject, papers } = useResearchProject();

  const [paper1Id, setPaper1Id] = useState('');
  const [paper2Id, setPaper2Id] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState(null);

  const handleCompare = async () => {
    if (!paper1Id || !paper2Id) return;
    if (paper1Id === paper2Id) {
      setError('Please select two different papers to compare.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setComparison(null);
      
      const res = await aiService.comparePapers(paper1Id, paper2Id);
      if (res && res.data) {
        setComparison(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate paper comparison matrix.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          <BrainCircuit size={20} />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl text-white m-0">AI Experiment Lab</h1>
          <p className="text-slate-400 text-xs mt-0.5">Compare methodologies, performance metrics, and accuracy side-by-side</p>
        </div>
      </div>

      {/* Warning if no workspace selected */}
      {!currentProject && (
        <div className="p-6 text-center glass-panel rounded-2xl border border-slate-800">
          <BrainCircuit size={48} className="mx-auto text-slate-600 mb-3" />
          <h2 className="font-heading font-bold text-white text-lg m-0">No Workspace Selected</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Please select or create a project workspace at the top header to choose papers for comparison.
          </p>
        </div>
      )}

      {currentProject && (
        <>
          {/* Paper Select Dropdowns */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paper Selector 1 */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">PAPER ONE</label>
                <select
                  value={paper1Id}
                  onChange={(e) => setPaper1Id(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-primary"
                >
                  <option value="">Select First Paper</option>
                  {papers.map((p) => (
                    <option key={p._id} value={p._id} disabled={p._id === paper2Id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paper Selector 2 */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">PAPER TWO</label>
                <select
                  value={paper2Id}
                  onChange={(e) => setPaper2Id(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand-primary"
                >
                  <option value="">Select Second Paper</option>
                  {papers.map((p) => (
                    <option key={p._id} value={p._id} disabled={p._id === paper1Id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              onClick={handleCompare}
              disabled={loading || !paper1Id || !paper2Id}
              className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-heading text-sm font-bold shadow hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" /> Cross-Examining Publications...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Perform Comparative Analysis
                </>
              )}
            </button>
          </div>

          {/* Comparative Results Area */}
          {comparison && (
            <div className="space-y-6">
              {/* Overall Winner Card */}
              <div className="relative glass-panel p-5 rounded-2xl border border-brand-primary/30 overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-4 bg-brand-primary/5">
                <div className="absolute top-0 right-0 w-[30%] h-[120%] bg-gradient-to-l from-brand-secondary/10 to-transparent pointer-events-none"></div>
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow shadow-orange-500/20 shrink-0">
                  <Trophy size={24} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-500">Gemini Verdict: Overall Contributor Winner</span>
                  <h3 className="font-heading font-extrabold text-base text-white m-0 leading-normal">
                    {comparison.comparison?.winner?.title}
                  </h3>
                  <p className="text-slate-300 text-xs mt-1 leading-normal font-medium">
                    {comparison.comparison?.winner?.reasoning}
                  </p>
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="p-4 border-b border-slate-800/60 font-heading font-bold text-sm text-slate-300">
                  Contrast Comparison Matrix
                </div>
                
                <div className="divide-y divide-slate-800/40">
                  {[
                    { label: 'Methodological Approach', text: comparison.comparison?.methodology },
                    { label: 'Dataset Size & Quality', text: comparison.comparison?.dataset },
                    { label: 'Performance Metrics', text: comparison.comparison?.performance },
                    { label: 'Novelty & Innovation', text: comparison.comparison?.novelty },
                    { label: 'Accuracy & Claims Validation', text: comparison.comparison?.accuracy },
                    { label: 'Limitations & Gaps', text: comparison.comparison?.limitations },
                  ].map((row, i) => (
                    <div key={i} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1 font-heading font-bold text-xs text-brand-secondary uppercase tracking-wider">
                        {row.label}
                      </div>
                      <div className="md:col-span-3 text-slate-300 text-xs leading-relaxed font-medium">
                        {row.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selection Hint state */}
          {!comparison && !loading && (
            <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800/80 flex flex-col items-center">
              <Activity size={36} className="text-slate-700 mb-3" />
              <h4 className="font-heading font-bold text-sm text-slate-400 m-0">Awaiting Selection</h4>
              <p className="text-[11px] text-slate-500 max-w-xs leading-normal mt-1">
                Choose two research papers from your database above, and trigger Gemini to parse their methodology, accuracy claims, and datasets side-by-side.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AILab;
