import React, { useState, useEffect } from 'react';
import { useResearchProject } from '../contexts/ResearchProjectContext';
import { ReactFlow, Controls, Background, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, X, HelpCircle, FileText, Share2 } from 'lucide-react';

const KnowledgeGraph = () => {
  const { currentProject, papers } = useResearchProject();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Programmatically construct graph nodes and edges from papers and their concepts
  const compileGraphData = () => {
    if (!currentProject) return;

    const tempNodes = [];
    const tempEdges = [];

    // 1. Central Workspace Project Node
    const projectNodeId = `project-${currentProject._id}`;
    tempNodes.push({
      id: projectNodeId,
      position: { x: 350, y: 250 },
      data: { label: currentProject.title },
      style: {
        background: 'rgba(139, 92, 246, 0.25)',
        color: '#fff',
        border: '2px solid #8b5cf6',
        borderRadius: '12px',
        padding: '12px',
        fontWeight: 'bold',
        fontSize: '12px',
        width: 150,
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
      },
    });

    const centerX = 350;
    const centerY = 250;
    const paperRadius = 180;
    const conceptRadius = 320;

    let totalConceptsCount = 0;
    papers.forEach((p) => {
      totalConceptsCount += p.concepts?.length || 0;
    });

    let paperIndex = 0;
    let conceptIndex = 0;

    // Set of added concept ids to avoid duplicate nodes
    const addedConceptIds = new Set();

    papers.forEach((paper) => {
      // 2. Paper Node: positioned on inner circle
      const angle = (paperIndex / papers.length) * 2 * Math.PI;
      const paperX = centerX + paperRadius * Math.cos(angle);
      const paperY = centerY + paperRadius * Math.sin(angle);
      const paperNodeId = `paper-${paper._id}`;

      tempNodes.push({
        id: paperNodeId,
        position: { x: paperX, y: paperY },
        data: { label: paper.title, description: paper.abstract, authors: paper.authors },
        style: {
          background: 'rgba(6, 182, 212, 0.2)',
          color: '#fff',
          border: '1.5px solid #06b6d4',
          borderRadius: '10px',
          padding: '8px',
          fontSize: '10px',
          width: 120,
          textAlign: 'center',
          backdropFilter: 'blur(6px)',
          cursor: 'pointer',
        },
      });

      // Edge from Project -> Paper
      tempEdges.push({
        id: `edge-proj-paper-${paper._id}`,
        source: projectNodeId,
        target: paperNodeId,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 1.5, opacity: 0.5 },
      });

      // 3. Concept Nodes & Relationships
      const paperConcepts = paper.concepts || [];
      paperConcepts.forEach((c) => {
        const conceptNodeId = `concept-${c.id}`;

        if (!addedConceptIds.has(conceptNodeId)) {
          addedConceptIds.add(conceptNodeId);

          const cAngle = (conceptIndex / Math.max(totalConceptsCount, 1)) * 2 * Math.PI;
          const conceptX = centerX + conceptRadius * Math.cos(cAngle);
          const conceptY = centerY + conceptRadius * Math.sin(cAngle);

          tempNodes.push({
            id: conceptNodeId,
            position: { x: conceptX, y: conceptY },
            data: { label: c.label, importance: c.importance, type: c.type },
            style: {
              background: 'rgba(30, 41, 59, 0.6)',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '6px',
              fontSize: '9px',
              width: 100,
              textAlign: 'center',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
            },
          });

          conceptIndex++;
        }

        // Edge from Paper -> Concept
        tempEdges.push({
          id: `edge-paper-${paper._id}-concept-${c.id}`,
          source: paperNodeId,
          target: conceptNodeId,
          style: { stroke: '#06b6d4', strokeWidth: 1, opacity: 0.4 },
        });
      });

      // Cross-concept relationships within this paper
      const paperRelations = paper.relationships || [];
      paperRelations.forEach((rel, rIdx) => {
        tempEdges.push({
          id: `edge-rel-${paper._id}-${rIdx}`,
          source: `concept-${rel.source}`,
          target: `concept-${rel.target}`,
          label: rel.type,
          labelStyle: { fill: '#64748b', fontSize: 8, fontWeight: 'bold' },
          style: { stroke: '#64748b', strokeWidth: 1.2, strokeDasharray: '4 4' },
        });
      });

      paperIndex++;
    });

    setNodes(tempNodes);
    setEdges(tempEdges);
  };

  useEffect(() => {
    compileGraphData();
  }, [papers, currentProject]);

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header Panel */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Network size={20} />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl text-white m-0">Knowledge Graph</h1>
            <p className="text-slate-400 text-xs mt-0.5">Explore connections between publications and scientific concepts</p>
          </div>
        </div>
        
        {currentProject && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            {nodes.length} Nodes mapped
          </span>
        )}
      </div>

      {/* Main Graph Area */}
      {!currentProject ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel rounded-2xl border border-slate-800/80">
          <Network size={48} className="text-slate-600 mb-3" />
          <h3 className="font-heading font-bold text-white text-base m-0">No Workspace Selected</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            Select or create a workspace using the dropdown above to load your publication graph.
          </p>
        </div>
      ) : (
        <div className="flex-1 relative flex gap-6 min-h-0">
          {/* React Flow Container */}
          <div className="flex-1 glass-panel rounded-2xl border border-slate-800/80 overflow-hidden relative bg-[#0b0f19]">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                fitView
                colorMode="dark"
                proOptions={{ hideAttribution: true }}
              >
                <Controls className="bg-slate-900 text-white border border-slate-800 rounded-xl" />
                <Background color="#1e293b" gap={16} size={1} />
              </ReactFlow>
            </ReactFlowProvider>
          </div>

          {/* Side Drawer: Node Details panel */}
          {selectedNode && (
            <div className="w-80 glass-panel rounded-2xl border border-slate-800/80 p-5 shrink-0 flex flex-col animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Node Inspector</span>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-200">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Node Title */}
                <div>
                  <h3 className="font-heading font-bold text-sm text-white m-0 leading-normal">
                    {selectedNode.data.label}
                  </h3>
                  
                  {/* Category Type */}
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[9px] font-bold text-brand-primary uppercase">
                    {selectedNode.id.split('-')[0]}
                  </span>
                </div>

                {/* Detail conditions */}
                {selectedNode.id.startsWith('paper-') && (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Authors</span>
                      <p className="text-slate-300 font-semibold leading-normal">
                        {selectedNode.data.authors?.join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-850">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Abstract Extract</span>
                      <p className="text-slate-400 leading-relaxed font-semibold italic">
                        "{selectedNode.data.description?.slice(0, 300)}..."
                      </p>
                    </div>
                  </>
                )}

                {selectedNode.id.startsWith('concept-') && (
                  <>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                      <span className="font-bold text-slate-400">Node Importance:</span>
                      <span className="font-heading font-extrabold text-sm text-brand-secondary">
                        {selectedNode.data.importance || 5}/10
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Concept Category</span>
                      <p className="text-slate-300 font-semibold uppercase">
                        {selectedNode.data.type || 'Generic Theory'}
                      </p>
                    </div>
                  </>
                )}

                {selectedNode.id.startsWith('project-') && (
                  <p className="text-slate-400 font-medium">
                    This is the central workspace index containing all nodes linked in your papers library database.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
