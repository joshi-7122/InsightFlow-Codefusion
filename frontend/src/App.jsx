import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { 
  Sparkles, Plus, Clock, MessageSquare, Settings, User, ChevronDown,
  FileSpreadsheet, AlertCircle, TrendingUp, Maximize2, Paperclip, Mic, Send, UploadCloud, Loader2, X
} from 'lucide-react';
import AnalystChatDrawer from './components/AnalystChatDrawer.jsx';
import { analyzeInput, sendFollowUpChat } from './lib/api.js';

const REPORTS_DATA = {
  'retail': {
    id: 'retail',
    title: 'Q3 Retail Revenue Analysis',
    summary: 'Revenue saw a significant dip in mid-March, primarily driven by the West Coast region. Conversely, profit margins remained relatively stable due to optimized operational costs.',
    metrics: [
      { label: 'TOTAL REVENUE', value: '₹12.45L', change: '+12% YoY', isPositive: true },
      { label: 'CHURN RISK', value: 'High', change: 'Action req.', isPositive: false }
    ],
    charts: [
      {
        id: 'chart_1',
        type: 'bar',
        title: 'Revenue vs Profit Breakdown (₹)',
        data: [
          { name: 'Jan', value: 400000, secondaryValue: 240000 },
          { name: 'Feb', value: 300000, secondaryValue: 139800 },
          { name: 'Mar', value: 200000, secondaryValue: 98000 },
          { name: 'Apr', value: 278000, secondaryValue: 390800 },
          { name: 'May', value: 189000, secondaryValue: 480000 },
          { name: 'Jun', value: 239000, secondaryValue: 380000 },
        ]
      },
      {
        id: 'chart_2',
        type: 'line',
        title: 'Weekly Traffic Trajectory',
        data: [
          { name: 'Week 1', value: 1200 },
          { name: 'Week 2', value: 1400 },
          { name: 'Week 3', value: 900 },
          { name: 'Week 4', value: 1700 },
        ]
      }
    ],
    anomalies: [
      { driver: 'Driver: Region West', description: 'Sales dropped 18% below forecasted model in Week 3, correlating with stockouts of top SKUs.', actionableStep: 'Actionable Step: Rush resupply', estImpact: 'Est. Impact: +14% ARR', severity: 'high' },
      { driver: 'Retention Spike', description: 'Cohorts engaged with the new feature show 2x higher retention over the last 14 days.', actionableStep: 'Actionable Step: Expand rollout', estImpact: 'Est. Impact: +5% LTV', severity: 'low' }
    ],
    followUpQuestions: [
      "How do we cut the 18% pending/failed rate across transfers?",
      "Simulate impact of recovering ₹28.4K high-risk fraud alerts",
      "Show cohort volume breakdown for Top 10% highest spenders"
    ]
  },
  'saas': {
    id: 'saas',
    title: 'SaaS Metrics & ARR Breakdown',
    summary: 'Net Revenue Retention (NRR) reached 118% this quarter. Expansion revenue offset logo churn, but customer acquisition cost (CAC) payback period lengthened slightly.',
    metrics: [
      { label: 'ANNUAL RUN RATE', value: '₹2.4 Cr', change: '+24% YoY', isPositive: true },
      { label: 'CAC PAYBACK', value: '14 Months', change: '+2 Mo Spike', isPositive: false }
    ],
    charts: [
      {
        id: 'chart_1',
        type: 'bar',
        title: 'ARR & Profit Trajectory (₹)',
        data: [
          { name: 'Q1', value: 5200000, secondaryValue: 3100000 },
          { name: 'Q2', value: 6400000, secondaryValue: 4200000 },
          { name: 'Q3', value: 7800000, secondaryValue: 5100000 },
          { name: 'Q4', value: 9100000, secondaryValue: 6300000 },
        ]
      },
      {
        id: 'chart_2',
        type: 'line',
        title: 'Active Customer Growth',
        data: [
          { name: 'Jan', value: 3400 },
          { name: 'Feb', value: 4100 },
          { name: 'Mar', value: 4800 },
          { name: 'Apr', value: 5600 },
        ]
      }
    ],
    anomalies: [
      { driver: 'Self-Serve Conversion Drop', description: 'Free-to-paid conversion rate decreased by 2.4% following the pricing page redesign.', actionableStep: 'Actionable Step: Revert pricing CTA', estImpact: 'Est. Impact: +₹4.5L MRR', severity: 'high' },
      { driver: 'Enterprise Upsell Rate', description: 'Mid-market accounts upgrading to Enterprise tier increased by 35% this month.', actionableStep: 'Actionable Step: Assign SDRs', estImpact: 'Est. Impact: +22% NRR', severity: 'low' }
    ],
    followUpQuestions: [
      "What pricing optimization moves average ticket size beyond ₹1,500?",
      "How do we cut logo churn across self-serve tiers?"
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
    charts: [
      {
        id: 'chart_1',
        type: 'bar',
        title: 'Daily Sales vs Margin (₹)',
        data: [
          { name: 'Mon', value: 180000, secondaryValue: 60000 },
          { name: 'Tue', value: 210000, secondaryValue: 75000 },
          { name: 'Wed', value: 240000, secondaryValue: 89000 },
          { name: 'Thu', value: 310000, secondaryValue: 110000 },
          { name: 'Fri', value: 540000, secondaryValue: 210000 },
          { name: 'Sat', value: 620000, secondaryValue: 240000 }
        ]
      },
      {
        id: 'chart_2',
        type: 'line',
        title: 'Weekly Covers Count',
        data: [
          { name: 'W1', value: 850 },
          { name: 'W2', value: 920 },
          { name: 'W3', value: 1100 },
          { name: 'W4', value: 1250 }
        ]
      }
    ],
    anomalies: [
      { driver: 'Dairy Supplier Markup', description: 'Local dairy vendor increased cream and cheese pricing by 22% without advance notice.', actionableStep: 'Actionable Step: Switch supplier', estImpact: 'Est. Impact: -6% COGS', severity: 'high' }
    ],
    followUpQuestions: [
      "How to reduce weekend food wastage from 8.1% to under 3%?",
      "Switch dairy supplier or renegotiate bulk terms?"
    ]
  },
  'budget': {
    id: 'budget',
    title: 'Campus Fest Budget & Expense Digest',
    summary: 'Total fest expenditure came in at ₹4,25,000 against an approved budget of ₹4,50,000. Sponsorship revenue exceeded targets by 15%.',
    metrics: [
      { label: 'BUDGET REMAINING', value: '₹25,000', change: 'Under budget', isPositive: true },
      { label: 'SPONSORSHIPS', value: '₹2.80L', change: '+15% Goal', isPositive: true }
    ],
    charts: [
      {
        id: 'chart_1',
        type: 'bar',
        title: 'Departmental Expenditure (₹)',
        data: [
          { name: 'Stage', value: 150000, secondaryValue: 142000 },
          { name: 'Artist', value: 180000, secondaryValue: 180000 },
          { name: 'Marketing', value: 50000, secondaryValue: 46000 },
          { name: 'Logistics', value: 70000, secondaryValue: 57000 }
        ]
      },
      {
        id: 'chart_2',
        type: 'line',
        title: 'Attendance Trajectory',
        data: [
          { name: 'Day 1', value: 3200 },
          { name: 'Day 2', value: 4800 },
          { name: 'Day 3', value: 6100 }
        ]
      }
    ],
    anomalies: [
      { driver: 'Ticket Sales Surge', description: 'VIP pass sales sold out in 45 minutes, generating ₹65,000 in unexpected revenue.', actionableStep: 'Actionable Step: Expand capacity', estImpact: 'Est. Impact: Net Surplus', severity: 'low' }
    ],
    followUpQuestions: [
      "Where should surplus ₹25,000 budget be reallocated?",
      "Which marketing channels yielded highest ticket conversions?"
    ]
  }
};

export default function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [previewTemplateReport, setPreviewTemplateReport] = useState(null);
  
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const newReportInputRef = useRef(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatSending, setIsChatSending] = useState(false);

  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);
  const activeReport = activeWorkspace?.activeReportData || previewTemplateReport;

  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isNewReportModalOpen) {
      setTimeout(() => newReportInputRef.current?.focus(), 50);
    }
  }, [isNewReportModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isNewReportModalOpen) {
        setIsNewReportModalOpen(false);
        setNewReportTitle('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewReportModalOpen]);

  const isDuplicateName = workspaces.some(
    ws => ws.name.toLowerCase() === newReportTitle.trim().toLowerCase()
  );

  const handleOpenAnalystChat = () => {
    setIsChatOpen(true);
    if (chatMessages.length === 0 && activeReport) {
      const grossVol = activeReport.metrics?.find(m => m.label?.toLowerCase().includes('volume') || m.label?.toLowerCase().includes('revenue'))?.value || '₹20.75L';
      const successRate = activeReport.metrics?.find(m => m.label?.toLowerCase().includes('success') || m.label?.toLowerCase().includes('rate'))?.value || '82%';
      const greetingText = `I've ingested your dataset for "${activeReport.title}". Gross volume stands at ${grossVol} with an ${successRate} success rate. What metrics would you like to explore?`;

      setChatMessages([
        {
          role: 'assistant',
          sender: 'analyst',
          content: greetingText,
          text: greetingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSendChatMessage = async (userText) => {
    if (!userText || !userText.trim() || isChatSending) return;

    const trimmedText = userText.trim();
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [
      ...chatMessages,
      { role: 'user', sender: 'user', content: trimmedText, text: trimmedText, timestamp: userTimestamp }
    ];

    setChatMessages(newMessages);
    setIsChatSending(true);
    setIsChatOpen(true);

    try {
      const response = await sendFollowUpChat({
        question: trimmedText,
        reportData: activeReport,
        conversationHistory: newMessages
      });
      const replyText = response?.answer || 'Unable to generate follow-up insights.';

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          sender: 'analyst',
          content: replyText,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Chat follow-up error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          sender: 'analyst',
          content: 'Failed to retrieve analysis: ' + err.message,
          text: 'Failed to retrieve analysis: ' + err.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleCreateReport = (e) => {
    if (e) e.preventDefault();
    const trimmed = newReportTitle.trim();
    if (!trimmed) return;

    let finalName = trimmed;
    let counter = 2;
    while (workspaces.some(ws => ws.name.toLowerCase() === finalName.toLowerCase())) {
      finalName = `${trimmed} (${counter})`;
      counter++;
    }

    const defaultReport = REPORTS_DATA['retail'];
    const newWorkspace = {
      id: `workspace-${Date.now()}`,
      name: finalName,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activeReportData: {
        ...defaultReport,
        id: `report-${Date.now()}`,
        title: finalName
      },
      messages: [],
      attachedFiles: []
    };

    setWorkspaces(prev => [newWorkspace, ...prev]);
    setActiveWorkspaceId(newWorkspace.id);
    setPreviewTemplateReport(null);
    setChatMessages([]);
    setNewReportTitle('');
    setIsNewReportModalOpen(false);
  };

  const triggerAnalysis = async (keyOrQuery, fileParam = null) => {
    const filesToUpload = files.length > 0 ? [...files] : (fileParam ? [fileParam] : []);
    const queryText = typeof keyOrQuery === 'string' ? keyOrQuery : inputText;

    setFiles([]);
    setInputText('');

    if (typeof keyOrQuery === 'string' && REPORTS_DATA[keyOrQuery] && filesToUpload.length === 0) {
      const templateData = REPORTS_DATA[keyOrQuery];
      if (activeWorkspaceId) {
        setWorkspaces(prev => prev.map(ws => {
          if (ws.id === activeWorkspaceId) {
            return {
              ...ws,
              activeReportData: templateData
            };
          }
          return ws;
        }));
      } else {
        setPreviewTemplateReport(templateData);
      }
      setChatMessages([]);
      return;
    }

    setIsLoading(true);
    setPreviewTemplateReport(null);

    try {
      const reportToSet = await analyzeInput({
        files: filesToUpload.length > 0 ? filesToUpload : undefined,
        file: filesToUpload[0] || undefined,
        textNote: queryText && !REPORTS_DATA[queryText] ? queryText : '',
        domain: typeof keyOrQuery === 'string' && REPORTS_DATA[keyOrQuery] ? keyOrQuery : 'general'
      });

      if (reportToSet) {
        if (activeWorkspaceId) {
          setWorkspaces(prev => prev.map(ws => {
            if (ws.id === activeWorkspaceId) {
              return {
                ...ws,
                activeReportData: reportToSet
              };
            }
            return ws;
          }));
        } else {
          const newWs = {
            id: `workspace-${Date.now()}`,
            name: reportToSet.title || (filesToUpload[0] ? filesToUpload[0].name : (queryText.substring(0, 30) || 'New Analysis')),
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            activeReportData: reportToSet,
            messages: [],
            attachedFiles: []
          };
          setWorkspaces(prev => [newWs, ...prev]);
          setActiveWorkspaceId(newWs.id);
        }
      }
    } catch (err) {
      console.error('Analysis invocation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      if (fileList.length > 5) {
        alert('Maximum of 5 files allowed. Only the first 5 files will be processed.');
        setFiles(fileList.slice(0, 5));
      } else {
        setFiles(fileList);
      }
    }
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      if (fileList.length > 5) {
        alert('Maximum of 5 files allowed. Only the first 5 files will be processed.');
        setFiles(fileList.slice(0, 5));
      } else {
        setFiles(fileList);
      }
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#0F111A] text-[#ECEDF3] font-body relative">
      
      {/* NEW REPORT MODAL */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-[#171A25] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[#ECEDF3] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-accent/20 border border-teal-accent/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-teal-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-bold">Create New Report</h3>
                </div>
                <p className="text-xs text-white/50">
                  Organize your data & sessions in an isolated workspace container.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsNewReportModalOpen(false);
                  setNewReportTitle('');
                }}
                className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/70 uppercase tracking-wider">
                  Report Name
                </label>
                <input
                  ref={newReportInputRef}
                  type="text"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder="e.g., Q3 Fintech Fraud Audit"
                  className="w-full bg-black/30 border border-white/15 focus:border-teal-accent focus:ring-1 focus:ring-teal-accent outline-none px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 transition-all font-body"
                />
                {isDuplicateName && (
                  <p className="text-[11px] text-teal-accent/80 font-mono flex items-center gap-1">
                    <span>* A report with this name exists. An incremental counter will be appended.</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewReportModalOpen(false);
                    setNewReportTitle('');
                  }}
                  className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newReportTitle.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-teal-accent text-obsidian shadow-[0_0_15px_rgba(63,199,181,0.3)] hover:shadow-[0_0_20px_rgba(63,199,181,0.5)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
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
            onClick={() => setIsNewReportModalOpen(true)}
            className="w-full flex items-center gap-2 justify-center bg-teal-accent/10 hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(63,199,181,0.15)] hover:shadow-[0_0_20px_rgba(63,199,181,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">New Report</span>
          </button>
        </div>

        {/* Workspaces List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
          {workspaces.length === 0 ? (
            <div className="text-[#6C7086] text-xs font-mono text-center py-8 px-4 flex flex-col items-center justify-center gap-1">
              <MessageSquare className="w-5 h-5 text-[#6C7086]/40 mb-1" />
              <span className="font-medium text-white/60">No past reports yet</span>
              <span className="text-[11px] text-white/30">Analyzed sessions will appear here.</span>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Workspaces ({workspaces.length})
              </h3>
              <ul className="space-y-1">
                {workspaces.map((ws) => (
                  <li key={ws.id}>
                    <button 
                      onClick={() => {
                        setPreviewTemplateReport(null);
                        setActiveWorkspaceId(ws.id);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                        activeWorkspaceId === ws.id ? 'bg-white/10 text-white font-medium border border-white/10' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-accent flex-shrink-0" />
                      <span className="truncate flex-1">{ws.name}</span>
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
              Supabase Backend Active
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
              <h3 className="font-heading text-lg font-bold text-teal-accent">Drop Data Payload Here</h3>
              <p className="text-xs text-white/60">InsightFlow will parse and synthesize metrics instantly</p>
            </div>
          </div>
        )}

        {/* WORKSPACE DASHBOARD CANVAS */}
        <div className="flex-1 overflow-y-auto pb-48 px-8 py-6 space-y-8 scrollbar-hide">
          
          {/* ZERO-STATE / HERO VIEW */}
          {!activeReport && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12 my-auto pt-12">
              
              <div className="text-center space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/20 text-teal-accent text-xs font-mono mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeWorkspace ? `Workspace: ${activeWorkspace.name}` : 'AI Decision Intelligence Canvas'}
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-white leading-tight">
                  Point it at your mess. <br />
                  <span className="bg-gradient-to-r from-teal-accent via-teal-300 to-violet-accent bg-clip-text text-transparent">
                    Get a report, not a spreadsheet.
                  </span>
                </h1>
                <p className="text-white/60 text-base font-body max-w-xl mx-auto leading-relaxed">
                  Upload raw data, CSVs, or describe issues. InsightFlow synthesizes the noise into actionable insights.
                </p>
              </div>

              {/* 4 Interactive Domain Template Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {[
                  { key: 'retail', title: 'Retail & E-commerce', desc: 'SKU stockouts, seasonal revenue dips & regional performance.', icon: TrendingUp },
                  { key: 'saas', title: 'SaaS Metrics', desc: 'ARR trajectory, NRR benchmarks, CAC payback & churn risks.', icon: BarChart },
                  { key: 'restaurant', title: 'Restaurant Ops', desc: 'COGS food cost spikes, prime cost loss & wastage alerts.', icon: AlertCircle },
                  { key: 'budget', title: 'Event / Budget', desc: 'Variance tracking, departmental spend & surplus analysis.', icon: FileSpreadsheet },
                ].map((preset) => {
                  const IconComp = preset.icon;
                  return (
                    <div 
                      key={preset.key}
                      onClick={() => triggerAnalysis(preset.key)}
                      className="group relative bg-[#171A25]/60 hover:bg-[#171A25] border border-white/10 hover:border-teal-accent/40 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(63,199,181,0.15)] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-accent/40 group-hover:bg-teal-accent/10 transition-colors">
                          <IconComp className="w-5 h-5 text-white/80 group-hover:text-teal-accent transition-colors" />
                        </div>
                        <h3 className="font-heading font-bold text-base text-white group-hover:text-teal-accent transition-colors">
                          {preset.title}
                        </h3>
                        <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                          {preset.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono group-hover:text-teal-accent">
                        <span>Load Template</span>
                        <span>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center my-auto py-24 space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-teal-accent/20 border-t-teal-accent animate-spin"></div>
                <Loader2 className="w-8 h-8 text-teal-accent animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-heading text-lg font-bold text-white">Synthesizing Intelligence...</h3>
                <p className="text-xs text-white/50 font-mono">Executing Supabase analyze-upload Edge Function</p>
              </div>
            </div>
          )}

          {/* ACTIVE REPORT DASHBOARD VIEW */}
          {activeReport && !isLoading && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Executive Summary Banner */}
              <div className="bg-gradient-to-r from-[#171A25] via-[#1C2030] to-[#171A25] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-accent/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-accent/10 border border-teal-accent/20 text-teal-accent text-xs font-mono">
                        <Sparkles className="w-3 h-3" /> Executive Brief
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAnalystChat}
                        className="flex items-center gap-1.5 text-xs font-mono bg-teal-accent/10 border border-teal-accent/30 text-teal-accent hover:bg-teal-accent/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask Decision Analyst</span>
                      </button>
                    </div>
                    <h2 className="text-2xl font-heading font-bold">{activeReport.title}</h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-3xl">
                      {activeReport.summary}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {(activeReport.metrics || []).map((metric, idx) => (
                      <div
                        key={`metric-${idx}-${metric.label || ''}`}
                        className={`border rounded-xl p-4 min-w-[140px] ${
                          metric.isPositive
                            ? 'bg-white/5 border-white/10'
                            : 'bg-coral-accent/10 border-coral-accent/20'
                        }`}
                      >
                        <div className={`text-xs mb-1 font-mono ${metric.isPositive ? 'text-white/50' : 'text-coral-accent/80'}`}>
                          {metric.label}
                        </div>
                        <div className="text-2xl font-heading font-bold">{metric.value}</div>
                        <div className={`text-xs font-mono ${metric.isPositive ? 'text-teal-accent' : 'text-coral-accent'}`}>
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Recharts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-[#171A25]/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-violet-accent" />
                      {activeReport?.charts?.[0]?.title || 'Distribution Breakdown'}
                    </h3>
                    <Maximize2 className="w-4 h-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeReport?.charts?.[0]?.data || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                        <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#171A25', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                        />
                        <Bar dataKey="value" fill="#9C8CFF" radius={[4, 4, 0, 0]} />
                        {activeReport?.charts?.[0]?.data?.[0]?.secondaryValue !== undefined && (
                          <Bar dataKey="secondaryValue" fill="#3FC7B5" radius={[4, 4, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#171A25]/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-accent" />
                      {activeReport?.charts?.[1]?.title || 'Trajectory Trends'}
                    </h3>
                    <Maximize2 className="w-4 h-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeReport?.charts?.[1]?.data || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                        <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#171A25', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#3FC7B5" strokeWidth={2} dot={{ fill: '#3FC7B5' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Insights / Anomaly Callouts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeReport.anomalies || []).map((anomaly, idx) => {
                  const isWarning = anomaly.severity === 'high' || anomaly.severity === 'medium' || anomaly.isWarning;
                  return (
                    <div
                      key={`anomaly-${idx}-${anomaly.driver || ''}`}
                      className={`border rounded-xl p-5 relative overflow-hidden group bg-gradient-to-br ${
                        isWarning
                          ? 'from-coral-accent/10 to-transparent border-coral-accent/20'
                          : 'from-violet-accent/10 to-transparent border-violet-accent/20'
                      }`}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        {isWarning ? <AlertCircle className="w-16 h-16 text-coral-accent" /> : <TrendingUp className="w-16 h-16 text-violet-accent" />}
                      </div>
                      <div className="relative z-10">
                        <div className={`text-xs font-mono mb-2 inline-block px-2 py-1 rounded ${
                          isWarning ? 'bg-coral-accent/20 text-coral-accent' : 'bg-violet-accent/20 text-violet-accent'
                        }`}>
                          {anomaly.driver || 'Anomaly Callout'}
                        </div>
                        <p className="text-sm font-body text-white/80 leading-relaxed mb-4">
                          {anomaly.description || anomaly.detail}
                        </p>
                        <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-white/10 text-white/50">
                          <span>{anomaly.actionableStep}</span>
                          <span className={isWarning ? 'text-coral-accent' : 'text-violet-accent'}>
                            {anomaly.estImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* BOTTOM FIXED OMNI-BAR */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent z-30 pointer-events-none">
          
          {activeReport && (
            <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 group/chips">
              {(activeReport.followUpQuestions || activeReport.suggested_followups || []).map((q, idx) => (
                <button
                  key={`chip-${idx}-${q.substring(0, 10)}`}
                  onClick={() => triggerAnalysis(q)}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto flex-shrink-0 text-xs font-mono bg-[#171A25]/90 hover:bg-teal-accent/15 border border-white/15 hover:border-teal-accent/50 text-white/80 hover:text-teal-accent px-3 py-1.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          )}

          <div className="max-w-3xl w-full mx-auto bg-[#171A25]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 pointer-events-auto focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all hover:shadow-[0_0_30px_rgba(63,199,181,0.1)]">
            
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 border-b border-white/10">
                {files.map((fileItem, idx) => (
                  <div key={`file-${idx}-${fileItem.name}`} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg text-xs font-mono text-white/90 border border-white/10">
                    <span className="truncate max-w-[140px]">{fileItem.name}</span>
                    <span className="text-[10px] text-white/40">({(fileItem.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="hover:text-coral-accent text-white/50 ml-1 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 w-full">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim() || files.length > 0) {
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
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors relative group cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-obsidian border border-white/10 text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                      CSV, XLSX, PDF, Images
                    </div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => triggerAnalysis('Voice Note Dictation')}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-teal-accent/20 rounded-lg scale-0 hover:scale-100 transition-transform"></div>
                    <Mic className="w-4 h-4 relative z-10" />
                  </button>
                </div>
                
                <button 
                  type="button"
                  onClick={() => {
                    if (inputText.trim() || files.length > 0) {
                      triggerAnalysis(inputText.trim());
                    }
                  }}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    inputText.trim().length > 0 || files.length > 0
                      ? 'bg-teal-accent text-obsidian shadow-[0_0_15px_rgba(63,199,181,0.4)]' 
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* INTERACTIVE AI ANALYST CHAT DRAWER */}
      <AnalystChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isSending={isChatSending}
        reportTitle={activeReport?.title || 'Active Report'}
      />
    </div>
  );
}
