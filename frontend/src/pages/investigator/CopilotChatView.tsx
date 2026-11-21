import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, User, Lock } from 'lucide-react';
import { Claim } from '../../types';

interface Props { claim: Claim; }
type Msg = { sender: 'user' | 'copilot'; text: string; citations?: string[] };

const QUICK_QUESTIONS = [
  'Compare the accident date and invoice date',
  'Is the vehicle registration consistent?',
  'Summarize all detected discrepancies',
  'What action is recommended next?',
];

export default function CopilotChatView({ claim }: Props) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      sender: 'copilot',
      text: `Hello Investigator 👋\n\nI am your InsureGuard AI Copilot, grounded exclusively on verified claim evidence for **${claim.claim_number}**.\n\nI can compare dates, cross-check registrations, or summarize discrepancies — with citations for every statement. What would you like to investigate?`,
      citations: ['System Context', 'Claim Evidence Index'],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: `Based on verified document evidence for **${claim.claim_number}**:\n\n• **Invoice vs Claim:** Repair invoice #INV-REPAIR-999 totals ₹60,000. The submitted claim requests ₹95,000 — a **36.8% variance** requiring justification.\n• **Vehicle Registration:** Repair bill specifies *DL05MN9999*, mismatching policy schedule *DL05MN5678*.\n• **Date Discrepancy:** Claim form states collision on 20/10/2024; Police Diary registers 25/10/2024.\n\n*Recommended next step:* Commission an independent surveyor inspection and verify invoice ledger directly with Metro Speed Auto Garage.`,
          citations: ['Repair_Invoice_999.pdf (p.1)', 'Police_Diary_Report.pdf (p.1)', 'Policy_Schedule.pdf (p.1)'],
        },
      ]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl">

      {/* Privacy badge */}
      <div className="shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-bold text-slate-200">Evidence-Grounded AI Copilot</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white/4 border border-white/8 rounded-lg px-2.5 py-1.5">
          <Lock className="h-3 w-3 text-emerald-400" />
          PII masked · Citation-only · No hallucinated verdicts
        </div>
      </div>

      {/* Quick prompts */}
      <div className="shrink-0 flex gap-2 flex-wrap mb-3">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/8 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
            }`}>
              {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            </div>

            <div className={`flex flex-col max-w-xl ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-[#1a2033] border border-white/8 text-slate-200 rounded-bl-sm'
              }`}>
                {m.text}
              </div>
              {m.citations && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-600">
                  <BookOpen className="h-3 w-3" />
                  <span>{m.citations.join(' · ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white animate-spin" />
            </div>
            <div className="bg-[#1a2033] border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
              <span className="text-xs text-slate-500">Grounding evidence...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(query)}
          placeholder="Ask about dates, amounts, registrations, or patterns..."
          className="flex-1 bg-[#1a2033] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-[#1f2840] transition"
        />
        <button
          onClick={() => sendMessage(query)}
          disabled={!query.trim() || loading}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition flex items-center gap-2 text-sm"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
