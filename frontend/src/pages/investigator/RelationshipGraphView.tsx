import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { Info, Inbox, RefreshCw } from 'lucide-react';
import api from '../../services/api';

interface Props { claimNumber: string; }

interface GraphNode {
  id: string;
  label: string;
  title?: string;
  color?: { background: string; border: string };
  font?: { color: string; size: number; face?: string };
  shape?: string;
  borderWidth?: number;
}
interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  color?: { color: string };
  font?: { color: string; size: number };
  arrows?: string;
  width?: number;
}

export default function RelationshipGraphView({ claimNumber }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchGraph = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/graph/${claimNumber}`);
      const data = res.data;
      setNodes(data.nodes ?? []);
      setEdges(data.edges ?? []);
      setSummary(data.summary ?? '');
    } catch {
      setNodes([]);
      setEdges([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [claimNumber]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const options = {
      nodes: { font: { size: 11 }, borderWidth: 2, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 8 } },
      edges: { arrows: 'to', font: { size: 9, align: 'middle' }, smooth: { type: 'continuous', roundness: 0.4 } },
      physics: { stabilization: { iterations: 150 }, barnesHut: { gravitationalConstant: -4000, springLength: 150, centralGravity: 0.3 } },
      interaction: { hover: true, tooltipDelay: 100 },
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    return () => network.destroy();
  }, [nodes, edges]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
        <p className="text-sm text-slate-500">Building relationship graph...</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mb-4">
          <Inbox className="h-7 w-7 text-slate-600" />
        </div>
        <h3 className="text-base font-bold text-slate-400">No Graph Data Available</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-xs leading-relaxed">
          {error
            ? 'Could not reach the backend graph service. Connect the backend API to load entity relationships.'
            : 'No entity relationships found for this claim yet.'}
        </p>
        <button
          onClick={fetchGraph}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Multi-Claim Entity Relationship Graph</h3>
          <p className="text-xs text-slate-500 mt-0.5">2-hop network discovery — recycled contacts, vehicles, and repair providers</p>
        </div>
        <button onClick={fetchGraph} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden border border-white/8 bg-[#0d1117]"
        ref={containerRef}
        style={{ height: '460px' }}
      />

      {summary && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-300 mb-1">Graph Analysis</p>
            <p className="text-xs text-slate-400 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
