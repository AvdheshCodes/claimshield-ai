import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { Share2, Info } from 'lucide-react';

interface Props {
  claimNumber: string;
}

export default function RelationshipGraphView({ claimNumber }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Synthetic Fraud Ring graph matching Neo4j seed
    const nodes = [
      { id: '1', label: `Claim: ${claimNumber}`, color: '#ef4444', font: { color: '#ffffff' }, shape: 'box' },
      { id: '2', label: 'Claimant: Priya Verma', color: '#f59e0b', font: { color: '#ffffff' }, shape: 'ellipse' },
      { id: '3', label: 'Vehicle: DL05MN5678', color: '#3b82f6', font: { color: '#ffffff' }, shape: 'ellipse' },
      { id: '4', label: 'Phone: +919876500001', color: '#dc2626', font: { color: '#ffffff' }, shape: 'box' },
      { id: '5', label: 'Garage: Metro Speed Auto', color: '#8b5cf6', font: { color: '#ffffff' }, shape: 'box' },
      { id: '6', label: 'Claimant: Suresh Gupta', color: '#f59e0b', font: { color: '#ffffff' }, shape: 'ellipse' },
      { id: '7', label: 'Claim: CS-2026-00004', color: '#64748b', font: { color: '#ffffff' }, shape: 'box' },
    ];

    const edges = [
      { from: '2', to: '1', label: 'SUBMITTED' },
      { from: '2', to: '3', label: 'OWNS' },
      { from: '1', to: '3', label: 'INVOLVES_VEHICLE' },
      { from: '1', to: '5', label: 'REPAIRED_AT' },
      { from: '2', to: '4', label: 'SHARES_CONTACT' },
      { from: '6', to: '4', label: 'SHARES_CONTACT' },
      { from: '6', to: '7', label: 'SUBMITTED' },
      { from: '7', to: '5', label: 'REPAIRED_AT' },
    ];

    const options = {
      nodes: {
        font: { size: 12, face: 'sans-serif' },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        arrows: 'to',
        font: { size: 10, align: 'middle' },
        smooth: { type: 'continuous' }
      },
      physics: {
        stabilization: true,
        barnesHut: { gravitationalConstant: -3000, springLength: 120 }
      },
      height: '520px'
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);
    return () => {
      network.destroy();
    };
  }, [claimNumber]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" /> Multi-Claim Entity Relationship Graph
          </h3>
          <p className="text-xs text-slate-500">2-hop network discovery identifying recycled contacts, vehicles, and repair providers</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Claim</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Customer</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Vehicle</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Garage</span>
        </div>
      </div>

      {/* Network Canvas */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50" ref={containerRef} />

      {/* Graph Narrative Observation */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Syndicate Ring Detected: </span>
          Claimant Priya Verma shares registered phone <span className="font-mono font-bold">+91-98765-00001</span> with Suresh Gupta. Both claimants routed repair claims (#CS-2026-00002 and #CS-2026-00004) through identical workshop <span className="font-bold">Metro Speed Auto Garage</span>.
        </div>
      </div>
    </div>
  );
}
