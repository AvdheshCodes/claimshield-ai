import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { Claim } from '../../types';

interface Props {
  claim: Claim;
}

export default function CopilotChatView({ claim }: Props) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'copilot'; text: string; citations?: string[] }>>([
    {
      sender: 'copilot',
      text: `Hello Investigator. I am your InsureGuard AI Investigation Copilot. I have indexed all submitted evidence for claim ${claim.claim_number}. You can ask me to compare accident and invoice dates, cross-check vehicle registrations, or summarize detected discrepancies.`,
      citations: ['System Context', 'Extracted Documents']
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!query.trim()) return;
    const userText = query;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      // Grounded synthetic response demonstrating citations
      let reply = `Based on the verified document evidence for ${claim.claim_number}:\n\n` +
        `• **Invoice Verification:** Repair invoice #INV-REPAIR-999 was issued on 28/10/2024 for INR 60,000, whereas the claim submission requested INR 95,000.\n` +
        `• **Registration Contradiction:** The repair bill specifies vehicle 'DL05MN9999', while the policy schedule covers 'DL05MN5678'.\n` +
        `• **Police Record:** The Delhi Traffic Diary registers the accident on 25/10/2024.\n\n` +
        `*Recommended step:* Independently confirm invoice ledger with Metro Speed Auto Garage.`;

      setMessages((prev) => [
        ...prev,
        {
          sender: 'copilot',
          text: reply,
          citations: ['Repair_Invoice_999.pdf (p.1)', 'Police_Diary_Report.pdf (p.1)', 'Policy_Schedule.pdf (p.1)']
        }
      ]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="border-b pb-3 mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" /> Evidence-Grounded AI Copilot
        </h3>
        <span className="text-xs text-slate-400">Strict citation mode (No hallucinated verdicts)</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`p-3.5 rounded-2xl max-w-xl text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
            {m.citations && (
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                <BookOpen className="h-3 w-3" />
                <span>Citations: {m.citations.join(' · ')}</span>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-slate-400 italic flex items-center gap-2">
            <Sparkles className="h-3 w-3 animate-spin text-purple-600" /> Grounding evidence from claim documents...
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="pt-3 border-t flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question (e.g. 'Compare the accident date and invoice date')..."
          className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition"
        >
          <Send className="h-4 w-4" /> Send
        </button>
      </div>
    </div>
  );
}
