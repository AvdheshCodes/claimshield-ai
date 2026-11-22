import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { Info, Inbox, RefreshCw, Network as NetworkIcon, ShieldAlert, Sparkles, X } from 'lucide-react';
import api from '../../services/api';

interface Props { claimNumber: string; }

interface RawGraphNode {
  id: string;
  label: string;
  name: string;
  group: string;
  properties?: Record<string, any>;
}

const GROUP_THEME: Record<string, { bg: string; border: string; text: string; label: string }> = {
  Claim:    { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5', label: 'Claim' },
  Customer: { bg: '#1e3a8a', border: '#3b82f6', text: '#93c5fd', label: 'Claimant' },
  Vehicle:  { bg: '#064e3b', border: '#10b981', text: '#6ee7b7', label: 'Vehicle' },
  Garage:   { bg: '#581c87', border: '#a855f7', text: '#d8b4fe', label: 'Repair Garage' },
  Phone:    { bg: '#78350f', border: '#f59e0b', text: '#fcd34d', label: 'Shared Contact' },
  Hospital: { bg: '#831843', border: '#ec4899', text: '#f9a8d4', label: 'Hospital' },
};

export default function RelationshipGraphView({ claimNumber }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RawGraphNode | null>(null);
  const [rawNodes, setRawNodes] = useState<RawGraphNode[]>([]);
  const [rawEdges, setRawEdges] = useState<any[]>([]);

  const fetchGraph = async () => {
    setLoading(true);
    setError(false);
    setSelectedNode(null);
    try {
      const res = await api.get(`/graph/${claimNumber}`);
      const data = res.data;
      setRawNodes(data.nodes ?? []);
      setRawEdges(data.edges ?? []);
      setSummary(data.summary ?? '');
    } catch {
      setRawNodes([]);
      setRawEdges([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [claimNumber]);

  useEffect(() => {
    if (!containerRef.current || rawNodes.length === 0) return;

    const mappedNodes = rawNodes.map((n: any) => {
      const group = n.group || 'Claim';
      const theme = GROUP_THEME[group] || { bg: '#1e293b', border: '#64748b', text: '#cbd5e1', label: group };
      return {
        id: n.id,
        label: `${n.group ? n.group.toUpperCase() : 'ENTITY'}\n${n.label}`,
        title: `${n.name || n.label} (${n.group})`,
        shape: 'box',
        color: {
          background: theme.bg,
          border: theme.border,
          highlight: { background: theme.bg, border: '#ffffff' }
        },
        font: {
          color: '#ffffff',
          size: 11,
          face: 'Inter, system-ui, sans-serif',
          multi: true,
          bold: { color: '#ffffff' }
        },
        margin: { top: 8, bottom: 8, left: 12, right: 12 },
        borderWidth: 2,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 8, x: 2, y: 2 },
        shapeProperties: { borderRadius: 6 }
      };
    });

    const mappedEdges = rawEdges.map((e: any, idx: number) => {
      const fromId = e.from || e.from_node;
      const toId = e.to || e.to_node;
      const isAlert = e.label === 'SHARES_CONTACT' || e.label === 'REPAIRED_AT';
      return {
        id: `edge-${idx}-${fromId}-${toId}`,
        from: fromId,
        to: toId,
        label: e.label,
        arrows: 'to',
        color: {
          color: e.label === 'SHARES_CONTACT' ? '#f59e0b' : (e.label === 'REPAIRED_AT' ? '#a855f7' : '#3b82f6'),
          highlight: '#ffffff'
        },
        font: {
          color: e.label === 'SHARES_CONTACT' ? '#fbbf24' : '#94a3b8',
          size: 9,
          strokeWidth: 0,
          align: 'middle'
        },
        width: isAlert ? 2 : 1.5,
        dashes: e.label === 'SHARES_CONTACT',
        smooth: { type: 'curvedCW', roundness: 0.15 }
      };
    });

    const options = {
      physics: {
        enabled: true,
        solver: 'barnesHut',
        barnesHut: {
          gravitationalConstant: -3500,
          centralGravity: 0.25,
          springLength: 140,
          springConstant: 0.05,
          damping: 0.09,
          avoidOverlap: 0.2
        },
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true
      }
    };

    const network = new Network(containerRef.current, { nodes: mappedNodes, edges: mappedEdges }, options);

    network.on('selectNode', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const selectedId = params.nodes[0];
        const found = rawNodes.find((n: any) => n.id === selectedId);
        if (found) setSelectedNode(found);
      }
    });

    network.on('deselectNode', () => {
      setSelectedNode(null);
    });

    return () => network.destroy();
  }, [rawNodes, rawEdges]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Resolving multi-claim 2-hop entity graph...</p>
      </div>
    );
  }

  if (rawNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-center">
        <div className="w-16 h-16 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mb-4">
          <Inbox className="h-7 w-7 text-slate-600" />
        </div>
        <h3 className="text-base font-bold text-slate-400">No Graph Data Available</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-xs leading-relaxed">
          {error
            ? 'Could not connect to the entity relationship graph service. Please ensure the backend is running.'
            : 'No entity relationships found for this claim yet.'}
        </p>
        <button
          onClick={fetchGraph}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition"
        >
          <RefreshCw className="h-4 w-4" /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#161b27] border border-white/8 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <NetworkIcon className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200">Multi-Claim Entity Relationship Graph</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              Syndicate Ring Detection
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">2-hop graph neighborhood uncovering recurrent phone numbers, vehicles, and garages</p>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-2 text-[10px]">
          {Object.entries(GROUP_THEME).map(([grp, thm]) => (
            <div key={grp} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: thm.border }} />
              <span className="text-slate-300 font-medium">{thm.label}</span>
            </div>
          ))}
          <button
            onClick={fetchGraph}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition ml-1"
            title="Refresh Graph"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Vis-Network Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0d14] shadow-2xl">
        <div ref={containerRef} style={{ height: '480px' }} />

        {/* Floating Node Inspector (Shown on Click) */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-[#161b27]/95 backdrop-blur-md border border-white/15 rounded-xl p-4 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${GROUP_THEME[selectedNode.group]?.bg || 'bg-white/10'} ${GROUP_THEME[selectedNode.group]?.text || 'text-white'}`}>
                {selectedNode.group.toUpperCase()}
              </span>
              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{selectedNode.name || selectedNode.label}</h4>
            <p className="text-xs text-slate-400 font-mono mb-3">ID: {selectedNode.id}</p>

            {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
              <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Properties</p>
                {Object.entries(selectedNode.properties).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{k.replace(/_/g, ' ')}:</span>
                    <span className="text-slate-200 font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explainable Graph Analysis Card */}
      {summary && (
        <div className="flex items-start gap-3.5 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-amber-300">Entity Ring Forensic Discovery</p>
              <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-amber-500/30 text-amber-200">Active Syndicate</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
