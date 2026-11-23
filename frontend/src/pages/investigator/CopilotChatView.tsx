import { useState, useRef, useEffect } from 'react';
import { Send, FileSearch, Lock, BookOpen, RefreshCw } from 'lucide-react';
import { Claim } from '../../types';
import api from '../../services/api';

interface Props { claim: Claim; }
type Msg = { sender: 'user' | 'copilot'; text: string; citations?: string[]; timestamp?: string };

const QUICK_QUESTIONS = [
  'Compare the accident date and invoice date',
  'Is the vehicle registration consistent across all documents?',
  'Summarize all detected line-item discrepancies',
  'What investigation action is recommended next?',
];

export default function CopilotChatView({ claim }: Props) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        sender: 'copilot',
        text: `**INVESTIGATION MEMORANDUM**\n\n**Subject:** Automated Evidence Analysis for Claim ${claim.claim_number}\n**Status:** Grounded against policy records and uploaded forensic artifacts.\n\nYou may query cross-document dates, invoice line-item math, registration consistency, or request recommended verification actions. All responses cite verified source records.`,
        citations: ['Primary Policy Record', 'PyMuPDF Document Extraction Base'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
    ]);
  }, [claim.id, claim.claim_number]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text, timestamp: now }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/copilot/query', {
        claim_id: claim.id,
        question: text,
      });
      const data = res.data;
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: data.answer ?? 'No findings returned for this query.',
          citations: data.citations?.map((c: any) => c.source_reference ?? c.document_type ?? 'Source') ?? [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: 'The AI Copilot service could not be reached. Please ensure the backend is running and claim documents have been processed.',
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] max-w-4xl bg-white border border-[#E1E6EB] rounded-xl shadow-sm p-5">

      {/* ── HEADER: INTERNAL INVESTIGATION MEMO HEADER ───────── */}
      <div className="shrink-0 flex items-center justify-between pb-3.5 border-b border-[#E1E6EB]">
        <div className="flex items-center gap-2.5">
          <FileSearch className="h-4 w-4 text-[#245B85]" />
          <div>
            <h4 className="text-sm font-semibold text-[#0D1B2A]">AI-Assisted Investigation Notes</h4>
            <p className="text-[11px] text-[#526477]">
              Case Dossier Intelligence · Grounded on Verified Claim Evidence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#526477] bg-[#F4F6F8] border border-[#E1E6EB] rounded px-2.5 py-1">
          <Lock className="h-3 w-3 text-[#25845A]" />
          <span>PII Masked · Fact-Checked Grounding</span>
        </div>
      </div>

      {/* ── QUICK PROMPTS BAR ───────────────────────────────── */}
      <div className="shrink-0 py-3 border-b border-[#E1E6EB] flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-[#718096] uppercase shrink-0">Inquiries:</span>
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="text-xs px-2.5 py-1 rounded bg-[#F4F6F8] hover:bg-[#E1E6EB] border border-[#E1E6EB] text-[#526477] hover:text-[#0D1B2A] transition shrink-0 whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* ── MESSAGES LIST ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-semibold text-[#526477]">
                {m.sender === 'user' ? 'Claims Officer' : 'Investigation Copilot'}
              </span>
              {m.timestamp && <span className="text-[10px] text-[#718096]">{m.timestamp}</span>}
            </div>

            <div
              className={`max-w-2xl rounded-xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#142B45] text-white'
                  : 'bg-[#F4F6F8] border border-[#E1E6EB] text-[#0D1B2A]'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#E1E6EB] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Cited Sources:
                  </span>
                  {m.citations.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[10px] font-mono bg-white border border-[#E1E6EB] text-[#245B85] px-1.5 py-0.5 rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#526477] bg-[#F4F6F8] border border-[#E1E6EB] p-3 rounded-xl max-w-sm">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#245B85]" />
            <span>Analyzing claim records and cross-referencing citations...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT BOX ───────────────────────────────────────── */}
      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage(query);
        }}
        className="shrink-0 pt-3 border-t border-[#E1E6EB] flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask an investigative inquiry regarding dates, parts, repair amounts, or evidence..."
          className="flex-1 bg-[#F4F6F8] border border-[#E1E6EB] rounded-lg px-3.5 py-2 text-xs text-[#0D1B2A] placeholder-[#718096] focus:outline-none focus:border-[#245B85] transition"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="px-4 py-2 bg-[#142B45] hover:bg-[#0D1B2A] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Inquire</span>
        </button>
      </form>
    </div>
  );
}
