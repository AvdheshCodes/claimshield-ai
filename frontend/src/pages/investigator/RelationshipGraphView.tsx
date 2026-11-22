import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { Inbox, RefreshCw, Network as NetworkIcon, X } from 'lucide-react';
import api from '../../services/api';

interface Props { claimNumber: string; }

interface RawGraphNode {
  id: string;
  label: string;
  name: string;
  group: string;
  properties?: Record<string, any>;
}

// Enterprise BFSI color palette for graph nodes
const GROUP_THEME: Record<string, { bg: string; border: string; fontColor: string; label: string }> = {
  Claim:    { bg: '#142B45', border: '#0D1B2A', fontColor: '#FFFFFF', label: 'Claim' },
  Customer: { bg: '#245B85', border: '#142B45', fontColor: '#FFFFFF', label: 'Claimant' },
  Vehicle:  { bg: '#526477', border: '#334155', fontColor: '#FFFFFF', label: 'Vehicle' },
  Garage:   { bg: '#C58A27', border: '#926014', fontColor: '#FFFFFF', label: 'Repair Garage' },
  Phone:    { bg: '#C44747', border: '#991B1B', fontColor: '#FFFFFF', label: 'Shared Contact' },
  Hospital: { bg: '#3478B8', border: '#1D4ED8', fontColor: '#FFFFFF', label: 'Medical Facility' },
};

export default function RelationshipGraphView({ claimNumber }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RawGraphNode | null>(null);
  const [rawNodes, setRawNodes] = useState<RawGraphNode[]>([]);
  const [rawEdges, setRawEdges] = useState<any[]>([]);

  const fetchGraph = async () => {
    setLoading(true);
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
      const theme = GROUP_THEME[group] || { bg: '#526477', border: '#334155', fontColor: '#FFFFFF', label: group };
      return {
        id: n.id,
        label: `${n.group ? n.group.toUpperCase() : 'ENTITY'}\n${n.label}`,
        title: `${n.name || n.label} (${n.group})`,
        shape: 'box',
        color: {
          background: theme.bg,
          border: theme.border,
          highlight: { background: theme.border, border: '#0D1B2A' }
        },
        font: {
          color: theme.fontColor,
          size: 11,
          face: 'Inter, system-ui, sans-serif',
          multi: true,
          bold: { color: theme.fontColor }
        },
        margin: { top: 8, bottom: 8, left: 12, right: 12 },
        borderWidth: 1.5,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.06)', size: 4, x: 1, y: 2 },
        shapeProperties: { borderRadius: 6 }
      };
    });

    const mappedEdges = rawEdges.map((e: any, idx: number) => {
      const fromId = e.from || e.from_node;
      const toId = e.to || e.to_node;
      const isAlert = e.label === 'SHARES_CONTACT';
      const isWarning = e.label === 'REPAIRED_AT';

      return {
        id: `edge-${idx}-${fromId}-${toId}`,
        from: fromId,
        to: toId,
        label: e.label,
        arrows: 'to',
        color: {
          color: isAlert ? '#C44747' : (isWarning ? '#C58A27' : '#718096'),
          highlight: '#142B45'
        },
        font: {
          color: isAlert ? '#C44747' : '#526477',
          size: 9,
          face: 'Inter, system-ui, sans-serif',
          strokeWidth: 3,
          strokeColor: '#FFFFFF',
          align: 'middle'
        },
        width: isAlert ? 2 : 1.5,
        smooth: { type: 'continuous' }
      };
    });

    const options = {
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -40,
          centralGravity: 0.01,
          springLength: 120,
          springConstant: 0.08,
          damping: 0.4
        },
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
        dragView: true
      }
    };

    const network = new Network(containerRef.current, { nodes: mappedNodes, edges: mappedEdges } as any, options);

    (network as any).on('click', (params: any) => {
      if (params.nodes && params.nodes.length > 0) {
        const clickedId = params.nodes[0];
        const found = rawNodes.find(n => n.id === clickedId);
        if (found) setSelectedNode(found);
      } else {
        setSelectedNode(null);
      }
    });

    return () => {
      network.destroy();
    };
  }, [rawNodes, rawEdges]);

  return (
    <div className="space-y-4">
      {/* ── TOP SUMMARY BAR ─────────────────────────────────── */}
      <div className="bg-white border border-[#E1E6EB] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EFF6FC] text-[#245B85] border border-[#245B85]/20 flex items-center gap-1.5">
              <NetworkIcon className="h-3 w-3" /> 2-Hop Syndicate Graph
            </span>
            <span className="text-xs text-[#718096] font-mono">Case: {claimNumber}</span>
          </div>
          <h4 className="text-sm font-semibold text-[#0D1B2A]">
            Entity Relationship & Multi-Claim Syndicate Network
          </h4>
          <p className="text-xs text-[#526477] mt-0.5">
            {summary || 'Visualizing cross-claim entities including policyholders, shared mobile numbers, and suspicious repair garages.'}
          </p>
        </div>

        <button
          onClick={fetchGraph}
          className="p-1.5 rounded-lg border border-[#E1E6EB] text-[#526477] hover:text-[#0D1B2A] hover:bg-[#F4F6F8] transition self-start sm:self-center"
          title="Refresh entity graph"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── GRAPH CANVAS & INSPECTOR ────────────────────────── */}
      <div className="relative bg-white border border-[#E1E6EB] rounded-xl overflow-hidden shadow-sm" style={{ height: '540px' }}>
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6 text-[#245B85] animate-spin" />
            <span className="text-xs text-[#526477]">Querying entity syndicate topology...</span>
          </div>
        )}

        {rawNodes.length === 0 && !loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <Inbox className="h-8 w-8 text-[#718096] mb-2" />
            <p className="text-sm font-semibold text-[#0D1B2A]">No Syndicate Connections Detected</p>
            <p className="text-xs text-[#526477] mt-1 max-w-sm">
              This claim does not share phone numbers, bank accounts, or high-risk garages with prior claims.
            </p>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-[#FDFDFD]" />
        )}

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-3 left-3 bg-white/95 border border-[#E1E6EB] rounded-lg p-2.5 shadow-sm text-xs z-10">
          <span className="text-[10px] font-semibold text-[#526477] uppercase tracking-wider block mb-1.5">
            Entity Class Legend
          </span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(GROUP_THEME).map(([key, t]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: t.bg }} />
                <span className="text-[11px] text-[#526477]">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Node Inspector Drawer at Right */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-72 bg-white border border-[#E1E6EB] rounded-xl p-4 shadow-md z-10 text-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F4F6F8] text-[#142B45] border border-[#E1E6EB] uppercase">
                  {selectedNode.group}
                </span>
                <h5 className="text-sm font-bold text-[#0D1B2A] mt-1.5">{selectedNode.name || selectedNode.label}</h5>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-[#718096] hover:text-[#0D1B2A]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-t border-[#E1E6EB] pt-2 space-y-1.5 font-mono text-[11px] text-[#526477]">
              <div>
                <span className="text-[#718096]">Entity ID:</span> {selectedNode.id}
              </div>
              {selectedNode.properties && Object.entries(selectedNode.properties).map(([k, v]) => (
                <div key={k}>
                  <span className="text-[#718096] capitalize">{k.replace(/_/g, ' ')}:</span> {String(v)}
                </div>
              ))}
            </div>

            {selectedNode.group === 'Garage' && (
              <div className="bg-[#FEF8EC] border border-[#C58A27]/25 p-2 rounded text-[11px] text-[#C58A27]">
                Notice: Multiple claims routed through this workshop within 30 days.
              </div>
            )}
            {selectedNode.group === 'Phone' && (
              <div className="bg-[#FDF2F2] border border-[#C44747]/25 p-2 rounded text-[11px] text-[#C44747]">
                Flag: Contact number shared across unrelated policyholders.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
