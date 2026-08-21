import React, { useState, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { 
  Sparkles, Plus, Clock, MessageSquare, Settings, User, ChevronDown,
  FileSpreadsheet, AlertCircle, TrendingUp, Maximize2, Paperclip, Mic, Send, UploadCloud, Loader2
} from 'lucide-react';

const REPORTS_DATA = {
  'retail': {
    id: 'retail',
    title: 'Q3 Retail Revenue Analysis',
    summary: 'Revenue saw a significant dip in mid-March, primarily driven by the West Coast region. Conversely, profit margins remained relatively stable due to optimized operational costs.',
    metrics: [
      { label: 'TOTAL REVENUE', value: '$124.5K', change: '+12% YoY', isPositive: true },
      { label: 'CHURN RISK', value: 'High', change: 'Action req.', isPositive: false }
    ],
    barData: [
      { name: 'Jan', revenue: 4000, profit: 2400 },
      { name: 'Feb', revenue: 3000, profit: 1398 },
      { name: 'Mar', revenue: 2000, profit: 9800 },
      { name: 'Apr', revenue: 2780, profit: 3908 },
      { name: 'May', revenue: 1890, profit: 4800 },
      { name: 'Jun', revenue: 2390, profit: 3800 },
    ],
    lineData: [
      { name: 'Week 1', traffic: 1200 },
      { name: 'Week 2', traffic: 1400 },
      { name: 'Week 3', traffic: 900 },
      { name: 'Week 4', traffic: 1700 },
    ],
    anomalies: [
      { type: 'ANOMALY DETECTED', title: 'Driver: Region West', desc: 'Sales dropped 18% below forecasted model in Week 3, correlating with stockouts of top SKUs.', action: 'Actionable Step: Rush resupply', impact: 'Est. Impact: +14% ARR', isWarning: true },
      { type: 'POSITIVE TREND', title: 'Retention Spike', desc: 'Cohorts engaged with the new feature show 2x higher retention over the last 14 days.', action: 'Actionable Step: Expand rollout', impact: 'Est. Impact: +5% LTV', isWarning: false }
    ]
  },
  'saas': {
    id: 'saas',
    title: 'SaaS Metrics & ARR Breakdown',
    summary: 'Net Revenue Retention (NRR) reached 118% this quarter. Expansion revenue offset logo churn, but customer acquisition cost (CAC) payback period lengthened slightly.',
    metrics: [
      { label: 'ANNUAL RUN RATE', value: '$2.4M', change: '+24% YoY', isPositive: true },
      { label: 'CAC PAYBACK', value: '14 Months', change: '+2 Mo Spike', isPositive: false }
    ],
    barData: [
      { name: 'Q1', revenue: 5200, profit: 3100 },
      { name: 'Q2', revenue: 6400, profit: 4200 },
      { name: 'Q3', revenue: 7800, profit: 5100 },
      { name: 'Q4', revenue: 9100, profit: 6300 },
    ],
    lineData: [
      { name: 'Jan', traffic: 3400 },
      { name: 'Feb', traffic: 4100 },
      { name: 'Mar', traffic: 4800 },
      { name: 'Apr', traffic: 5600 },
    ],
    anomalies: [
      { type: 'ANOMALY DETECTED', title: 'Self-Serve Conversion Drop', desc: 'Free-to-paid conversion rate decreased by 2.4% following the pricing page redesign.', action: 'Actionable Step: Revert pricing CTA', impact: 'Est. Impact: +$45K MRR', isWarning: true },
      { type: 'POSITIVE TREND', title: 'Enterprise Upsell Rate', desc: 'Mid-market accounts upgrading to Enterprise tier increased by 35% this month.', action: 'Actionable Step: Assign SDRs', impact: 'Est. Impact: +22% NRR', isWarning: false }
    ]
  },
  'restaurant': {
    id: 'restaurant',
    title: 'Restaurant Food Cost Spike Digest',
    summary: 'Ingredient costs surged by 14% due to dairy and meat supplier price increases. Wastage logs indicate 8% inventory loss on peak weekend nights.',
    metrics: [
      { label: 'GROSS MARGIN', value: '62.4%', change: '-4.2% MoM', isPositive: false },
      { label: 'FOOD WASTAGE', value: '8.1%', change: 'High Loss', isPositive: false }
    ],
    barData: [
      { name: 'Mon', revenue: 1800, profit: 600 },
      { name: 'Tue', revenue: 2100, profit: 750 },
      { name: 'Wed', revenue: 2400, profit: 890 },
      { name: 'Thu', revenue: 3100, profit: 1100 },
      { name: 'Fri', revenue: 5400, profit: 2100 },
      { name: 'Sat', revenue: 6200, profit: 2400 }
    ],
    lineData: [
      { name: 'W1', traffic: 850 },
      { name: 'W2', traffic: 920 },
      { name: 'W3', traffic: 1100 },
      { name: 'W4', traffic: 1250 }
    ],
    anomalies: [
      { type: 'ANOMALY DETECTED', title: 'Dairy Supplier Markup', desc: 'Local dairy vendor increased cream and cheese pricing by 22% without advance notice.', action: 'Actionable Step: Switch supplier', impact: 'Est. Impact: -6% COGS', isWarning: true }
    ]
  },
  'budget': {
    id: 'budget',
    title: 'Campus Fest Budget & Expense Digest',
    summary: 'Total fest expenditure came in at $42,500 against an approved budget of $45,000. Sponsorship revenue exceeded targets by 15%.',
    metrics: [
      { label: 'BUDGET REMAINING', value: '$2.5K', change: 'Under budget', isPositive: true },
      { label: 'SPONSORSHIPS', value: '$28.0K', change: '+15% Goal', isPositive: true }
    ],
    barData: [
      { name: 'Stage', revenue: 15000, profit: 14200 },
      { name: 'Artist', revenue: 18000, profit: 18000 },
      { name: 'Marketing', revenue: 5000, profit: 4600 },
      { name: 'Logistics', revenue: 7000, profit: 5700 }
    ],
    lineData: [
      { name: 'Day 1', traffic: 3200 },
      { name: 'Day 2', traffic: 4800 },
      { name: 'Day 3', traffic: 6100 }
    ],
    anomalies: [
      { type: 'POSITIVE TREND', title: 'Ticket Sales Surge', desc: 'VIP pass sales sold out in 45 minutes, generating $6,500 in unexpected revenue.', action: 'Actionable Step: Expand capacity', impact: 'Est. Impact: Net Surplus', isWarning: false }
    ]
  }
};

export default function App() {
  const [activeReport, setActiveReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const triggerAnalysis = (keyOrQuery) => {
    setIsLoading(true);
    setTimeout(() => {
      let reportToSet = REPORTS_DATA[keyOrQuery];
      if (!reportToSet) {
        // Generate custom dynamic report payload for user query/file
        reportToSet = {
          id: `custom-${Date.now()}`,
          title: keyOrQuery.length > 30 ? `Analysis: "${keyOrQuery.substring(0, 27)}..."` : `Analysis: ${keyOrQuery}`,
          summary: `InsightFlow parsed your payload "${keyOrQuery}". Anomaly patterns suggest a shift in top performing channels with moderate volatility across key metrics.`,
          metrics: [
            { label: 'PARSED DATA POINTS', value: '1,420', change: '100% Validated', isPositive: true },
            { label: 'CONFIDENCE SCORE', value: '94.8%', change: 'High Precision', isPositive: true }
          ],
          barData: REPORTS_DATA['retail'].barData,
          lineData: REPORTS_DATA['retail'].lineData,
          anomalies: [
            { type: 'ANOMALY DETECTED', title: 'Data Variance Identified', desc: 'Statistical variance exceeded expected baseline by 12.4% during peak volume hours.', action: 'Actionable Step: Monitor telemetry', impact: 'Est. Impact: Optimized Ops', isWarning: true }
          ]
        };
      }
      setActiveReport(reportToSet);
      setHistory(prev => [reportToSet, ...prev.filter(item => item.id !== reportToSet.id)]);
      setIsLoading(false);
      setInputText('');
    }, 1200);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileName = e.dataTransfer.files[0].name;
      triggerAnalysis(`Uploaded file: ${fileName}`);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      triggerAnalysis(`Uploaded file: ${fileName}`);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#0F111A] text-[#ECEDF3] font-body">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".csv,.xlsx,.pdf,image/*" 
      />

      {/* LEFT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 h-screen flex flex-col border-r border-white/10 bg-obsidian-light/50 backdrop-blur-md transition-all duration-300">
        
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-teal-accent/20 border border-teal-accent/30">
            <Sparkles className="w-4 h-4 text-teal-accent animate-pulse" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">InsightFlow</span>
        </div>

        {/* New Report Action */}
        <div className="px-4 py-2">
          <button 
            onClick={() => {
              setActiveReport(null);
              setIsLoading(false);
              setInputText('');
            }}
            className="w-full flex items-center gap-2 justify-center bg-teal-accent/10 hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(63,199,181,0.15)] hover:shadow-[0_0_20px_rgba(63,199,181,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">New Report</span>
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
          {history.length === 0 ? (
            <div className="text-[#6C7086] text-xs font-mono text-center py-8 px-4 flex flex-col items-center justify-center gap-1">
              <MessageSquare className="w-5 h-5 text-[#6C7086]/40 mb-1" />
              <span className="font-medium text-white/60">No past reports yet</span>
              <span className="text-[11px] text-white/30">Analyzed sessions will appear here.</span>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Recent Reports
              </h3>
              <ul className="space-y-1">
                {history.map((item) => (
                  <li key={item.id}>
                    <button 
                      onClick={() => setActiveReport(item)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                        activeReport?.id === item.id ? 'bg-white/10 text-white font-medium' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-accent" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom User / Settings */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between bg-black/20 rounded-lg p-2 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-accent/20 flex items-center justify-center">
                <User className="w-3 h-3 text-violet-accent" />
              </div>
              <span className="text-sm font-medium">Team Nexa</span>
            </div>
            <Settings className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
          </div>
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-white/40 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-accent animate-pulse"></span>
              Gemini 2.0 Flash Active
            </span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 flex flex-col h-screen min-w-0 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#131622] via-obsidian to-obsidian"
      >
        
        {/* Drag and Drop Overlay Indicator */}
        {isDragging && (
          <div className="absolute inset-4 z-50 rounded-2xl border-2 border-dashed border-teal-accent/60 bg-teal-accent/10 backdrop-blur-md flex flex-col items-center justify-center gap-4 pointer-events-none animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-teal-accent/20 flex items-center justify-center border border-teal-accent/40 animate-bounce">
              <UploadCloud className="w-8 h-8 text-teal-accent" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-heading font-bold text-teal-accent">Drop file to analyze</h3>
              <p className="text-sm text-white/70">Supports CSV, XLSX, PDF, and dashboard screenshots</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-48">
          
          {/* LOADING STATE */}
          {isLoading ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-teal-accent/10 border border-teal-accent/30 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-teal-accent animate-spin" />
                </div>
                <div className="absolute -inset-2 rounded-3xl bg-teal-accent/10 blur-xl -z-10 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-heading font-bold text-white">Synthesizing raw data into decision report...</h3>
                <p className="text-sm text-white/50">Gemini 2.0 Multimodal engine extracting schema & anomalies</p>
              </div>
            </div>
          ) : !activeReport ? (
            /* INITIAL HERO / ZERO-STATE VIEW */
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center max-w-4xl mx-auto text-center space-y-12 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 leading-tight">
                  Point it at your mess.<br/>Get a report, not a spreadsheet.
                </h1>
                <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
                  Upload raw data, screenshots, or voice notes. InsightFlow synthesizes the noise into actionable insights.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {[
                  { key: "retail", title: "Retail & E-commerce", icon: TrendingUp, desc: "Revenue & region dips" },
                  { key: "saas", title: "SaaS Metrics", icon: BarChart, desc: "ARR, CAC & Cohorts" },
                  { key: "restaurant", title: "Restaurant Ops", icon: AlertCircle, desc: "Food cost & wastage" },
                  { key: "budget", title: "Event / Budget", icon: FileSpreadsheet, desc: "Expenses & digests" }
                ].map((preset, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => triggerAnalysis(preset.key)}
                    className="glass-card flex flex-col items-center justify-center p-6 rounded-2xl hover:bg-white/5 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group cursor-pointer text-center"
                  >
                    <preset.icon className="w-8 h-8 mb-4 text-white/40 group-hover:text-teal-accent transition-colors" />
                    <span className="font-medium text-sm text-white/90 group-hover:text-white mb-1">{preset.title}</span>
                    <span className="text-xs text-white/40 group-hover:text-white/60">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ACTIVE DYNAMIC REPORT VIEW */
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
              
              {/* Executive Summary Banner */}
              <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-accent"></div>
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <h2 className="text-2xl font-heading font-bold">{activeReport.title}</h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-3xl">
                      {activeReport.summary}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {activeReport.metrics.map((metric, idx) => (
                      <div 
                        key={idx} 
                        className={`border rounded-xl p-4 min-w-[140px] ${
                          metric.isPositive 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-coral-accent/10 border-coral-accent/20'
                        }`}
                      >
                        <div className={`text-xs mb-1 font-mono ${metric.isPositive ? 'text-white/50' : 'text-coral-accent/80'}`}>
                          {metric.label}
                        </div>
                        <div className={`text-2xl font-heading font-bold ${metric.isPositive ? 'text-white' : 'text-coral-accent'}`}>
                          {metric.value}
                        </div>
                        <div className={`text-xs flex items-center gap-1 mt-1 ${metric.isPositive ? 'text-teal-accent' : 'text-coral-accent'}`}>
                          {metric.isPositive ? <TrendingUp className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart Card 1 */}
                <div className="glass-card rounded-2xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-white/90">Revenue vs Profit Breakdown</h3>
                    <button className="text-white/40 hover:text-white transition-colors cursor-pointer">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeReport.barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" tick={{fill: '#ffffff60', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff40" tick={{fill: '#ffffff60', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{backgroundColor: '#171A25', borderColor: '#ffffff20', borderRadius: '8px'}}
                          itemStyle={{color: '#fff'}}
                        />
                        <Bar dataKey="revenue" fill="#3FC7B5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" fill="#9C8CFF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart Card 2 */}
                <div className="glass-card rounded-2xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-white/90">Traffic & Engagement Trajectory</h3>
                    <button className="text-white/40 hover:text-white transition-colors cursor-pointer">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeReport.lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" tick={{fill: '#ffffff60', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff40" tick={{fill: '#ffffff60', fontSize: 12}} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{backgroundColor: '#171A25', borderColor: '#ffffff20', borderRadius: '8px'}}
                          itemStyle={{color: '#fff'}}
                        />
                        <Line type="monotone" dataKey="traffic" stroke="#3FC7B5" strokeWidth={3} dot={{r: 4, fill: '#171A25', stroke: '#3FC7B5', strokeWidth: 2}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Insights / Callouts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReport.anomalies.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`border rounded-xl p-5 relative overflow-hidden group bg-gradient-to-br ${
                      item.isWarning 
                        ? 'from-coral-accent/10 to-transparent border-coral-accent/20' 
                        : 'from-violet-accent/10 to-transparent border-violet-accent/20'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      {item.isWarning ? <AlertCircle className="w-16 h-16 text-coral-accent" /> : <TrendingUp className="w-16 h-16 text-violet-accent" />}
                    </div>
                    <div className="relative z-10">
                      <div className={`text-xs font-mono mb-2 inline-block px-2 py-1 rounded ${
                        item.isWarning ? 'text-coral-accent bg-coral-accent/10' : 'text-violet-accent bg-violet-accent/10'
                      }`}>
                        {item.type}
                      </div>
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-white/60 text-sm mb-3">{item.desc}</p>
                      <div className="text-sm font-medium border-t border-white/10 pt-3 flex items-center justify-between">
                        <span>{item.action}</span>
                        <span className="text-teal-accent">{item.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* BOTTOM OMNIBAR */}
        <div className="sticky bottom-0 z-30 w-full px-6 pb-6 pt-8 flex flex-col items-center gap-3 bg-gradient-to-t from-[#0F111A] via-[#0F111A]/95 to-transparent pointer-events-none group">
          
          {/* Quick Follow-ups */}
          {activeReport && !isLoading && (
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl w-full opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:translate-y-0 focus-within:pointer-events-auto transition-all duration-300 delay-500 group-hover:delay-0 group-hover:duration-200 ease-out">
              {["Why did West sales drop?", "Show monthly profit trend", "Simulate 10% price increase"].map((q, idx) => (
                <button 
                  key={idx} 
                  style={{ transitionDelay: `${idx * 25}ms` }} 
                  onClick={() => triggerAnalysis(q)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="max-w-3xl w-full mx-auto bg-[#171A25]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-3 pointer-events-auto focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all hover:shadow-[0_0_30px_rgba(63,199,181,0.1)]">
            
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim()) {
                    triggerAnalysis(inputText.trim());
                  }
                }
              }}
              placeholder="Ask a follow-up, drop messy CSVs, or describe anomalies..."
              className="w-full bg-transparent border-none resize-none outline-none p-2 text-white placeholder:text-white/30 min-h-[44px] max-h-[150px] overflow-y-auto font-body"
              rows={1}
            />
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors relative group cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-obsidian border border-white/10 text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                    CSV, XLSX, PDF, Images
                  </div>
                </button>
                <button 
                  onClick={() => triggerAnalysis('Voice Note Dictation')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-teal-accent/20 rounded-lg scale-0 hover:scale-100 transition-transform"></div>
                  <Mic className="w-4 h-4 relative z-10" />
                </button>
              </div>
              
              <button 
                onClick={() => {
                  if (inputText.trim()) {
                    triggerAnalysis(inputText.trim());
                  }
                }}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  inputText.trim().length > 0 
                    ? 'bg-teal-accent text-obsidian shadow-[0_0_15px_rgba(63,199,181,0.4)]' 
                    : 'bg-white/5 text-white/30'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
