import React from 'react';
import { 
  BarChart, Sparkles, Plus, MessageSquare, Settings, User, ChevronDown,
  FileSpreadsheet, AlertCircle, TrendingUp, Paperclip, Mic, Send
} from 'lucide-react';

export default function App() {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#0F111A] text-[#ECEDF3] font-body relative">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 h-screen flex flex-col border-r border-white/10 bg-obsidian-light/50 backdrop-blur-md transition-all duration-300">
        
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-teal-accent/20 border border-teal-accent/30">
            <Sparkles className="w-4 h-4 text-teal-accent" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">InsightFlow</span>
        </div>

        {/* New Report Action (Static UI Placeholder) */}
        <div className="px-4 py-2">
          <div className="w-full flex items-center gap-2 justify-center bg-teal-accent/10 border border-teal-accent/30 text-teal-accent py-2 rounded-xl opacity-60 cursor-not-allowed">
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">New Report</span>
          </div>
        </div>

        {/* Workspaces List (Static Placeholder) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
          <div className="text-[#6C7086] text-xs font-mono text-center py-8 px-4 flex flex-col items-center justify-center gap-1">
            <MessageSquare className="w-5 h-5 text-[#6C7086]/40 mb-1" />
            <span className="font-medium text-white/60">No active reports</span>
            <span className="text-[11px] text-white/30">UI actions are currently disabled.</span>
          </div>
        </div>

        {/* Bottom User / Settings */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between bg-black/20 rounded-lg p-2 border border-white/5 opacity-80 cursor-default">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-accent/20 flex items-center justify-center">
                <User className="w-3 h-3 text-violet-accent" />
              </div>
              <span className="text-sm font-medium">Team Nexa</span>
            </div>
            <Settings className="w-4 h-4 text-white/40" />
          </div>
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-white/40 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white/30"></span>
              UI Framework Standby
            </span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen min-w-0 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#131622] via-obsidian to-obsidian">
        
        {/* WORKSPACE DASHBOARD CANVAS */}
        <div className="flex-1 overflow-y-auto pb-48 px-8 py-6 space-y-8 scrollbar-hide">
          
          {/* STATIC HERO VIEW */}
          <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12 my-auto pt-12">
            
            {/* Centered headline */}
            <div className="text-center space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/20 text-teal-accent text-xs font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI Decision Intelligence Canvas
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-white leading-tight">
                Point it at your mess. <br />
                <span className="bg-gradient-to-r from-teal-accent via-teal-300 to-violet-accent bg-clip-text text-transparent">
                  Get a report, not a spreadsheet.
                </span>
              </h1>
              <p className="text-white/60 text-base font-body max-w-xl mx-auto leading-relaxed">
                Upload raw data, screenshots, or voice notes. InsightFlow synthesizes the noise into actionable insights.
              </p>
            </div>

            {/* 4 Static Domain Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {[
                { title: 'Retail & E-commerce', desc: 'SKU stockouts, seasonal revenue dips & regional performance.', icon: TrendingUp },
                { title: 'SaaS Metrics', desc: 'ARR trajectory, NRR benchmarks, CAC payback & churn risks.', icon: BarChart },
                { title: 'Restaurant Ops', desc: 'COGS food cost spikes, prime cost loss & wastage alerts.', icon: AlertCircle },
                { title: 'Event / Budget', desc: 'Variance tracking, departmental spend & surplus analysis.', icon: FileSpreadsheet },
              ].map((preset, idx) => {
                const IconComp = preset.icon;
                return (
                  <div 
                    key={`preset-${idx}`}
                    className="relative bg-[#171A25]/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between opacity-75 cursor-default"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-white/60" />
                      </div>
                      <h3 className="font-heading font-bold text-base text-white/90">
                        {preset.title}
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/30 font-mono">
                      <span>UI Component</span>
                      <span>—</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* BOTTOM FIXED OMNI-BAR (Static UI Only) */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent z-30 pointer-events-none">
          <div className="max-w-3xl w-full mx-auto bg-[#171A25]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 pointer-events-auto opacity-80">
            <div className="flex items-center gap-3 w-full">
              <textarea 
                disabled
                placeholder="Ask a follow-up, drop messy CSVs, or describe anomalies... (UI disabled)"
                className="w-full bg-transparent border-none resize-none outline-none p-2 text-white/50 placeholder:text-white/30 min-h-[44px] max-h-[150px] overflow-y-auto font-body cursor-not-allowed"
                rows={1}
              />
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="p-2 rounded-lg text-white/30 cursor-not-allowed">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div className="p-2 rounded-lg text-white/30 cursor-not-allowed">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="p-2 rounded-lg bg-white/5 text-white/20 cursor-not-allowed">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
