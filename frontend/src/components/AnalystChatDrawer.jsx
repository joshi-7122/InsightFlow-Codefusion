import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2, MessageSquare } from 'lucide-react';

export default function AnalystChatDrawer({
  isOpen,
  onClose,
  messages = [],
  onSendMessage,
  isSending = false,
  reportTitle = 'Active Report'
}) {
  const [inputQuestion, setInputQuestion] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isSending]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = inputQuestion.trim();
    if (!trimmed || isSending) return;

    onSendMessage(trimmed);
    setInputQuestion('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg h-full bg-[#171A25] border-l border-white/10 shadow-2xl flex flex-col justify-between text-[#ECEDF3] relative animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-light/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-accent/20 border border-teal-accent/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-teal-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm">InsightFlow Decision Analyst</h3>
                <span className="text-[10px] font-mono bg-teal-accent/15 text-teal-accent border border-teal-accent/30 px-2 py-0.5 rounded-full">
                  AI Analyst
                </span>
              </div>
              <p className="text-xs text-white/50 truncate max-w-[240px]">
                {reportTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MESSAGES BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-white/40">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-teal-accent/60" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-white/80">Interactive Decision Analyst</h4>
                <p className="text-xs mt-1 text-white/40 max-w-xs">
                  Ask deep-dive questions about churn, revenue simulation, anomalies, or root causes across your dataset.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user' || msg.sender === 'user';
              const textContent = msg.content || msg.text || '';
              return (
                <div
                  key={`msg-${idx}-${msg.timestamp || idx}`}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                    isUser 
                      ? 'bg-teal-accent/20 text-teal-accent border-teal-accent/30' 
                      : 'bg-violet-accent/20 text-violet-accent border-violet-accent/30'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-teal-accent/15 border border-teal-accent/25 text-white/90 rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none font-body space-y-1.5'
                  }`}>
                    <div className="whitespace-pre-wrap font-sans">
                      {textContent}
                    </div>
                    {msg.timestamp && (
                      <div className={`text-[10px] font-mono mt-1 ${isUser ? 'text-teal-accent/60 text-right' : 'text-white/30'}`}>
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-violet-accent/20 border border-violet-accent/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-accent animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/10 text-teal-accent/90 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-accent" />
                <span>InsightFlow Analyst is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FOOTER */}
        <div className="p-4 border-t border-white/10 bg-obsidian-light/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a follow-up, drop messy CSVs, or describe anomalies..."
              disabled={isSending}
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/30 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isSending}
              className="absolute right-2 p-2 rounded-lg bg-teal-accent text-obsidian font-bold disabled:opacity-30 hover:opacity-90 transition-all cursor-pointer"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin text-obsidian" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
