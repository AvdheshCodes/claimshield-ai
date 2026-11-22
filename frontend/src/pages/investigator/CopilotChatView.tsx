import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, BookOpen, User, Lock } from 'lucide-react';
import { Claim } from '../../types';
import api from '../../services/api';

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
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        sender: 'copilot',
        text: `Hello Investigator 👋\n\nI am your InsureGuard AI Copilot, grounded exclusively on verified claim evidence for **${claim.claim_number}**.\n\nAsk me to compare incident and invoice dates, cross-check vehicle registrations, summarize financial discrepancies, or inspect repair items. I cite verified evidence for every answer.`,
        citations: ['System Context · Verified Claim Evidence Base'],
      },
    ]);
  }, [claim.id, claim.claim_number]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
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
          text: data.answer ?? 'No answer returned.',
          citations: data.citations?.map((c: any) => c.source_reference ?? c.document_type ?? 'Source') ?? [],
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: 'The AI Copilot backend is not reachable. Please ensure the FastAPI service is running and claim documents have been processed.',
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl">

      {/* Header */}
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
            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${
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
              {m.citations && m.citations.length > 0 && (
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
