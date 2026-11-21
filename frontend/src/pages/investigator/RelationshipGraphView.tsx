import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { Info, ZoomIn, ZoomOut } from 'lucide-react';

interface Props { claimNumber: string; }

export default function RelationshipGraphView({ claimNumber }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = [
      { id: '1', label: `${claimNumber}`, title: 'Active Claim Under Investigation', color: { background: '#ef4444', border: '#dc2626' }, font: { color: '#fff', size: 11, face: 'monospace' }, shape: 'box', borderWidth: 2 },
      { id: '2', label: 'Priya Verma', title: 'Primary Claimant', color: { background: '#f59e0b', border: '#d97706' }, font: { color: '#fff', size: 11 }, shape: 'ellipse' },
      { id: '3', label: 'DL05MN5678', title: 'Registered Vehicle', color: { background: '#3b82f6', border: '#2563eb' }, font: { color: '#fff', size: 10 }, shape: 'diamond' },
      { id: '4', label: '+91-98765-00001', title: 'Shared Phone — RISK INDICATOR', color: { background: '#dc2626', border: '#b91c1c' }, font: { color: '#fff', size: 10 }, shape: 'box', borderWidth: 3 },
      { id: '5', label: 'Metro Speed Auto\nGarage', title: 'Repair Provider — Linked to 2 claims', color: { background: '#8b5cf6', border: '#7c3aed' }, font: { color: '#fff', size: 10 }, shape: 'box' },
      { id: '6', label: 'Suresh Gupta', title: 'Second Claimant — shares phone', color: { background: '#f59e0b', border: '#d97706' }, font: { color: '#fff', size: 11 }, shape: 'ellipse' },
      { id: '7', label: 'CS-2026-00004', title: 'Second Claim — same garage', color: { background: '#64748b', border: '#475569' }, font: { color: '#fff', size: 11, face: 'monospace' }, shape: 'box' },
    ];

    const edges = [
      { from: '2', to: '1', label: 'FILED', color: { color: '#6b7280' }, font: { color: '#94a3b8', size: 9 }, arrows: 'to' },
      { from: '2', to: '3', label: 'OWNS', color: { color: '#6b7280' }, font: { color: '#94a3b8', size: 9 }, arrows: 'to' },
      { from: '1', to: '3', label: 'INVOLVES', color: { color: '#3b82f6' }, font: { color: '#94a3b8', size: 9 }, arrows: 'to' },
      { from: '1', to: '5', label: 'REPAIRED AT', color: { color: '#8b5cf6' }, font: { color: '#94a3b8', size: 9 }, arrows: 'to' },
      { from: '2', to: '4', label: 'USES', color: { color: '#ef4444' }, font: { color: '#fca5a5', size: 9 }, arrows: 'to', width: 2 },
      { from: '6', to: '4', label: 'USES', color: { color: '#ef4444' }, font: { color: '#fca5a5', size: 9 }, arrows: 'to', width: 2 },
      { from: '6', to: '7', label: 'FILED', color: { color: '#6b7280' }, font: { color: '#94a3b8', size: 9 }, arrows: 'to' },
      { from: '7', to: '5', label: 'REPAIRED AT', color: { color: '#8b5cf6' }, font: { color: '#94a3b8', size: 9 }, arrows: 'to' },
    ];

    const options = {
      nodes: { font: { size: 11 }, borderWidth: 2, shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 8 } },
      edges: { arrows: 'to', font: { size: 9, align: 'middle' }, smooth: { type: 'continuous', roundness: 0.4 } },
      physics: { stabilization: { iterations: 150 }, barnesHut: { gravitationalConstant: -4000, springLength: 150, centralGravity: 0.3 } },
      background: { color: 'transparent' },
      interaction: { hover: true, tooltipDelay: 100 },
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    return () => network.destroy();
  }, [claimNumber]);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Multi-Claim Entity Relationship Graph</h3>
          <p className="text-xs text-slate-500 mt-0.5">2-hop network discovery — recycled contacts, vehicles, and repair providers</p>
        </div>
        <div className="flex gap-3 text-xs text-slate-500">
          {[
            { color: 'bg-red-500', label: 'Claim' },
            { color: 'bg-amber-500', label: 'Customer' },
            { color: 'bg-blue-500', label: 'Vehicle' },
            { color: 'bg-purple-500', label: 'Garage' },
            { color: 'bg-red-700', label: 'Shared Contact' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="rounded-2xl overflow-hidden border border-white/8 bg-[#0d1117]"
        ref={containerRef}
        style={{ height: '460px' }}
      />

      {/* Insight alert */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-300 mb-1">Syndicate Ring Detected</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Claimant <span className="text-white font-semibold">Priya Verma</span> shares registered phone{' '}
            <span className="font-mono text-amber-300">+91-98765-00001</span> with{' '}
            <span className="text-white font-semibold">Suresh Gupta</span>. Both claimants routed repair claims
            through identical workshop <span className="text-white font-semibold">Metro Speed Auto Garage</span>.
            This pattern matches known fraud ring characteristics.
          </p>
        </div>
      </div>
    </div>
  );
}
