import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Sparkles, FileText, Plus, Send, Paperclip, Mic, TrendingUp, AlertTriangle,
  TrendingDown, User, Settings, Clock, MessageSquare, ChevronDown,
  FileSpreadsheet, AlertCircle, Maximize2, UploadCloud, Loader2, X, Layers
} from 'lucide-react';
import { analyzeInput, sendFollowUpChat } from './lib/api.js';

const REPORTS_DATA = {
  'retail': {
    id: 'retail',
    title: 'Retail & E-commerce Revenue Analysis',
    summary: 'Revenue saw a significant dip in mid-March, primarily driven by the West Coast region. Conversely, profit margins remained relatively stable due to optimized operational costs.',
    metrics: [
      { label: 'TOTAL REVENUE', value: '$124.5K', change: '+12% YoY', isPositive: true },
      { label: 'CHURN RISK', value: 'High', change: 'Action req.', isPositive: false }
    ],
    charts: [
      {
        id: 'chart_1',
        type: 'bar',
        title: 'Revenue vs Profit Breakdown',
        data: [
          { name: 'Jan', value: 4000, secondaryValue: 2400 },
          { name: 'Feb', value: 3000, secondaryValue: 1398 },
          { name: 'Mar', value: 2000, secondaryValue: 9800 },
          { name: 'Apr', value: 2780, secondaryValue: 3908 },
          { name: 'May', value: 1890, secondaryValue: 4800 },
          { name: 'Jun', value: 2390, secondaryValue: 3800 },
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
    charts: [
      {
        id: 'chart_1',
        type: 'bar',
        title: 'ARR & Profit Trajectory',
        data: [
          { name: 'Q1', value: 5200, secondaryValue: 3100 },
          { name: 'Q2', value: 6400, secondaryValue: 4200 },
          { name: 'Q3', value: 7800, secondaryValue: 5100 },
          { name: 'Q4', value: 9100, secondaryValue: 6300 },
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
      { driver: 'Self-Serve Conversion Drop', description: 'Free-to-paid conversion rate decreased by 2.4% following the pricing page redesign.', actionableStep: 'Actionable Step: Revert pricing CTA', estImpact: 'Est. Impact: +$45K MRR', severity: 'high' },
      { driver: 'Enterprise Upsell Rate', description: 'Mid-market accounts upgrading to Enterprise tier increased by 35% this month.', actionableStep: 'Actionable Step: Assign SDRs', estImpact: 'Est. Impact: +22% NRR', severity: 'low' }
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
        title: 'Daily Sales vs Margin',
        data: [
          { name: 'Mon', value: 1800, secondaryValue: 600 },
          { name: 'Tue', value: 2100, secondaryValue: 750 },
          { name: 'Wed', value: 2400, secondaryValue: 890 },
          { name: 'Thu', value: 3100, secondaryValue: 1100 },
          { name: 'Fri', value: 5400, secondaryValue: 2100 },
          { name: 'Sat', value: 6200, secondaryValue: 2400 }
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
    charts: [
      {
        id: 'chart_1',
        type: 'bar',
        title: 'Departmental Expenditure',
        data: [
          { name: 'Stage', value: 15000, secondaryValue: 14200 },
          { name: 'Artist', value: 18000, secondaryValue: 18000 },
          { name: 'Marketing', value: 5000, secondaryValue: 4600 },
          { name: 'Logistics', value: 7000, secondaryValue: 5700 }
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
      { driver: 'Ticket Sales Surge', description: 'VIP pass sales sold out in 45 minutes, generating $6,500 in unexpected revenue.', actionableStep: 'Actionable Step: Expand capacity', estImpact: 'Est. Impact: Net Surplus', severity: 'low' }
    ]
  }
};

function EmptyWorkspaceHero({ activeWorkspace, onSelectPreset }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-5xl mx-auto space-y-8 py-8 px-4 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/20 text-teal-accent text-xs font-mono">
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
        Upload raw data, screenshots, or voice notes. InsightFlow synthesizes the noise into actionable insights.
      </p>

      {/* 4 Interactive Domain Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full text-left pt-4">
        {[
          { key: 'retail', title: 'Retail & E-commerce', desc: 'SKU stockouts, seasonal revenue dips & regional performance.', icon: TrendingUp },
          { key: 'saas', title: 'SaaS Metrics', desc: 'ARR trajectory, NRR benchmarks, CAC payback & churn risks.', icon: Layers },
          { key: 'restaurant', title: 'Restaurant Ops', desc: 'COGS food cost spikes, prime cost loss & wastage alerts.', icon: AlertCircle },
          { key: 'budget', title: 'Event / Budget', desc: 'Variance tracking, departmental spend & surplus analysis.', icon: FileSpreadsheet },
        ].map((preset) => {
          const IconComp = preset.icon;
          return (
            <div
              key={preset.key}
              onClick={() => onSelectPreset(preset.key)}
              className="group relative bg-[#171A25]/60 hover:bg-[#171A25] border border-white/10 hover:border-teal-accent/40 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(63,199,181,0.15)] cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-accent/40 transition-colors">
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
  );
}

function App() {
  // User-created Workspaces State Management (safely initialized array)
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);

  // Preview Mode State
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // New Report Modal State
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const newReportInputRef = useRef(null);

  // Error Banner State
  const [analysisError, setAnalysisError] = useState(null);

  // Active Workspace & Report computed state with safe fallbacks
  const activeWorkspace = (workspaces || []).find(ws => ws?.id === activeWorkspaceId) || null;
  const activeReportData = activeWorkspace?.data || null;
  const currentReportToDisplay = previewMode && previewData ? previewData : activeReportData;

  // Analysis State
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [analyzingFiles, setAnalyzingFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Keyboard shortcut (Escape) to close modal
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

  // Check duplicate report names
  const isDuplicateName = (workspaces || []).some(
    ws => ws?.name?.toLowerCase() === newReportTitle.trim().toLowerCase()
  );

  const handleCreateReport = (e) => {
    if (e) e.preventDefault();
    const trimmed = newReportTitle.trim();
    if (!trimmed) return;

    let finalName = trimmed;
    let counter = 2;
    while ((workspaces || []).some(ws => ws?.name?.toLowerCase() === finalName.toLowerCase())) {
      finalName = `${trimmed} (${counter})`;
      counter++;
    }

    const newWorkspace = {
      id: `workspace-${Date.now()}`,
      name: finalName,
      createdAt: new Date().toISOString(),
      data: null,
      messages: []
    };

    setWorkspaces(prev => [newWorkspace, ...(prev || [])]);
    setActiveWorkspaceId(newWorkspace.id);
    setFiles([]);
    setInputText('');
    setNewReportTitle('');
    setIsNewReportModalOpen(false);
    setAnalysisError(null);

    if (previewMode) {
      setPreviewMode(false);
      setPreviewData(null);
    }
  };

  const handleSelectWorkspace = (workspaceId) => {
    const targetWs = (workspaces || []).find((w) => w?.id === workspaceId);
    if (!targetWs) return;

    setActiveWorkspaceId(workspaceId);

    if (previewMode) {
      setPreviewMode(false);
      setPreviewData(null);
    }

    setFiles([]);
    setInputText('');
    setAnalysisError(null);
  };

  const handleSelectPreset = (presetKey) => {
    const preset = REPORTS_DATA[presetKey];
    if (!preset) return;
    setPreviewMode(true);
    setPreviewData(preset);
    setFiles([]);
    setInputText('');
    setAnalysisError(null);
  };

  const triggerAnalysis = async (keyOrQuery, fileParam = null) => {
    const filesToUpload = files.length > 0 ? [...files] : (fileParam ? [fileParam] : []);
    const queryText = typeof keyOrQuery === 'string' ? keyOrQuery : inputText;

    setAnalyzingFiles(filesToUpload);
    setAnalysisError(null);
    setIsLoading(true);

    if (previewMode) {
      setPreviewMode(false);
      setPreviewData(null);
    }

    try {
      // Follow-up question on active report
      if (activeReportData?.id && filesToUpload.length === 0 && queryText && !REPORTS_DATA[queryText]) {
        try {
          const chatResult = await sendFollowUpChat({
            reportId: activeReportData.id,
            message: queryText
          });

          if (chatResult) {
            setWorkspaces(prev => (prev || []).map(ws => {
              if (ws?.id === activeWorkspaceId) {
                const updatedData = { ...(ws.data || {}) };
                if (chatResult.chart_update) {
                  const existingCharts = [...(updatedData.charts || [])];
                  const chartIdx = existingCharts.findIndex(c => c?.id === chatResult.chart_update.id);
                  if (chartIdx >= 0) {
                    existingCharts[chartIdx] = chatResult.chart_update;
                  } else {
                    existingCharts.push(chatResult.chart_update);
                  }
                  updatedData.charts = existingCharts;
                }
                const updatedMessages = [
                  ...(ws.messages || []),
                  { role: 'user', content: queryText },
                  { role: 'assistant', content: chatResult.answer }
                ];
                return {
                  ...ws,
                  data: updatedData,
                  messages: updatedMessages
                };
              }
              return ws;
            }));
            setIsLoading(false);
            setAnalyzingFiles([]);
            setFiles([]);
            setInputText('');
            return;
          }
        } catch (chatErr) {
          console.warn('Follow-up chat failed, falling back to full analysis:', chatErr);
        }
      }

      let reportToSet = null;

      if (typeof keyOrQuery === 'string' && REPORTS_DATA[keyOrQuery] && filesToUpload.length === 0) {
        reportToSet = REPORTS_DATA[keyOrQuery];
      } else {
        reportToSet = await analyzeInput({
          files: filesToUpload.length > 0 ? filesToUpload : undefined,
          textNote: queryText && !REPORTS_DATA[queryText] ? queryText : '',
          domain: typeof keyOrQuery === 'string' && REPORTS_DATA[keyOrQuery] ? keyOrQuery : 'general'
        });
      }

      if (reportToSet) {
        if (activeWorkspaceId) {
          setWorkspaces(prev => (prev || []).map(ws => {
            if (ws?.id === activeWorkspaceId) {
              return {
                ...ws,
                data: reportToSet
              };
            }
            return ws;
          }));
        } else {
          const newWs = {
            id: `workspace-${Date.now()}`,
            name: reportToSet.title || (filesToUpload[0] ? filesToUpload[0].name : (queryText.substring(0, 30) || 'New Analysis')),
            createdAt: new Date().toISOString(),
            data: reportToSet,
            messages: []
          };
          setWorkspaces(prev => [newWs, ...(prev || [])]);
          setActiveWorkspaceId(newWs.id);
        }
      }
    } catch (err) {
      console.error('Analysis invocation failed:', err);
      setAnalysisError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
      setAnalyzingFiles([]);
      setFiles([]);
      setInputText('');
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

      {/* PREVIEW MODE BANNER */}
      {previewMode && previewData && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#171A25]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-accent/20 border border-teal-accent/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-white">Preview Mode</h3>
              <p className="text-xs text-white/60 font-mono">Sample {previewData?.title?.split(' & ')?.[0] || 'Template'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newWs = {
                  id: `workspace-${Date.now()}`,
                  name: previewData.title,
                  createdAt: new Date().toISOString(),
                  data: previewData,
                  messages: []
                };
                setWorkspaces(prev => [newWs, ...(prev || [])]);
                setActiveWorkspaceId(newWs.id);
                setPreviewMode(false);
                setPreviewData(null);
                setFiles([]);
                setInputText('');
                setAnalysisError(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-accent text-obsidian shadow-[0_0_15px_rgba(63,199,181,0.3)] hover:shadow-[0_0_20px_rgba(63,199,181,0.5)] transition-all cursor-pointer"
            >
              Use this template
            </button>
            <button
              onClick={() => {
                setPreviewMode(false);
                setPreviewData(null);
                setFiles([]);
                setInputText('');
                setAnalysisError(null);
              }}
              className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* Analysis Error Banner */}
      {analysisError && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-red-500/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-200" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-white">Analysis Error</h3>
              <p className="text-xs text-white/60 font-mono">{analysisError}</p>
            </div>
          </div>
          <button
            onClick={() => setAnalysisError(null)}
            className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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

        <div className="p-4 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-teal-accent/20 border border-teal-accent/30">
            <Sparkles className="w-4 h-4 text-teal-accent animate-pulse" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">InsightFlow</span>
        </div>

        <div className="px-4 py-2">
          <button
            onClick={() => setIsNewReportModalOpen(true)}
            className="w-full flex items-center gap-2 justify-center bg-teal-accent/10 hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(63,199,181,0.15)] hover:shadow-[0_0_20px_rgba(63,199,181,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">New Report</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
          {(workspaces || []).length === 0 ? (
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
                {(workspaces || []).map((ws) => (
                  <li key={ws?.id}>
                    <button
                      onClick={() => handleSelectWorkspace(ws?.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                        !previewMode && activeWorkspaceId === ws?.id ? 'bg-white/10 text-white font-medium border border-white/10' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-accent flex-shrink-0" />
                      <span className="truncate flex-1">{ws?.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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
              Gemini 3.6 Flash Active
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
        className="flex-1 flex flex-col h-full min-w-0 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#131622] via-obsidian to-obsidian overflow-hidden"
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

        {/* MAIN CONTENT CONTAINER */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto px-6 py-6 pb-48 scrollbar-hide relative">

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center space-y-4 py-12">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-teal-accent/20 border-t-teal-accent animate-spin"></div>
                <Loader2 className="w-8 h-8 text-teal-accent animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-heading text-lg font-bold text-white">Synthesizing Intelligence...</h3>
                <p className="text-xs text-white/50 font-mono">Running Gemini 3.6 Flash multimodal analysis & anomaly detection</p>

                {analyzingFiles.length > 0 && (
                  <div className="mt-4 text-xs text-white/40 font-mono text-center">
                    Analyzing {analyzingFiles.length} file{analyzingFiles.length !== 1 ? 's' : ''}:
                    <div className="mt-1 flex flex-wrap gap-1 justify-center">
                      {analyzingFiles.map((file, idx) => (
                        <span key={idx} className="bg-white/10 px-2 py-1 rounded text-xs">{file.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ZERO-STATE / HERO VIEW */}
          {!currentReportToDisplay && !isLoading && (
            <EmptyWorkspaceHero
              activeWorkspace={activeWorkspace}
              onSelectPreset={handleSelectPreset}
            />
          )}

          {/* ACTIVE REPORT DASHBOARD VIEW */}
          {currentReportToDisplay && !isLoading && (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Executive Summary Banner */}
              <div className="bg-gradient-to-r from-[#171A25] via-[#1C2030] to-[#171A25] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-accent/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-accent/10 border border-teal-accent/20 text-teal-accent text-xs font-mono">
                      <Sparkles className="w-3 h-3" /> Executive Brief
                    </div>
                    <h2 className="text-2xl font-heading font-bold">{currentReportToDisplay?.title || 'Dataset Analysis'}</h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-3xl">
                      {currentReportToDisplay?.summary || 'No summary available.'}
                    </p>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {(currentReportToDisplay?.metrics || []).map((metric, idx) => (
                      <div
                        key={`metric-${idx}-${metric?.label || ''}`}
                        className={`border rounded-xl p-4 min-w-[140px] ${
                          metric?.isPositive
                            ? 'bg-white/5 border-white/10'
                            : 'bg-coral-accent/10 border-coral-accent/20'
                        }`}
                      >
                        <div className={`text-xs mb-1 font-mono ${metric?.isPositive ? 'text-white/50' : 'text-coral-accent/80'}`}>
                          {metric?.label}
                        </div>
                        <div className="text-2xl font-heading font-bold">{metric?.value}</div>
                        <div className={`text-xs font-mono ${metric?.isPositive ? 'text-teal-accent' : 'text-coral-accent'}`}>
                          {metric?.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Recharts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Bar Chart Card */}
                <div className="bg-[#171A25]/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-violet-accent" />
                      {currentReportToDisplay?.charts?.[0]?.title || 'Distribution Breakdown'}
                    </h3>
                    <Maximize2 className="w-4 h-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentReportToDisplay?.charts?.[0]?.data || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                        <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#171A25', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                        />
                        <Bar dataKey="value" fill="#9C8CFF" radius={[4, 4, 0, 0]} />
                        {currentReportToDisplay?.charts?.[0]?.data?.[0]?.secondaryValue !== undefined && (
                          <Bar dataKey="secondaryValue" fill="#3FC7B5" radius={[4, 4, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart Card */}
                <div className="bg-[#171A25]/80 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-accent" />
                      {currentReportToDisplay?.charts?.[1]?.title || 'Trajectory Trends'}
                    </h3>
                    <Maximize2 className="w-4 h-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentReportToDisplay?.charts?.[1]?.data || []}>
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
                {(currentReportToDisplay?.anomalies || []).map((anomaly, idx) => {
                  const isWarning = anomaly?.severity === 'high' || anomaly?.severity === 'medium' || anomaly?.isWarning;
                  return (
                    <div
                      key={`anomaly-${idx}-${anomaly?.driver || ''}`}
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
                          {anomaly?.driver || 'Anomaly Callout'}
                        </div>
                        <p className="text-sm font-body text-white/80 leading-relaxed mb-4">
                          {anomaly?.description}
                        </p>
                        <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-white/10 text-white/50">
                          <span>{anomaly?.actionableStep}</span>
                          <span className={isWarning ? 'text-coral-accent' : 'text-violet-accent'}>
                            {anomaly?.estImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Follow-Up Q&A Thread */}
              {!previewMode && activeWorkspace?.messages && activeWorkspace.messages.length > 0 && (
                <div className="bg-[#171A25]/90 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-accent" /> Report Follow-Up & Insights Thread
                  </h3>
                  <div className="space-y-3">
                    {activeWorkspace.messages.map((msg, idx) => (
                      <div
                        key={`msg-${idx}`}
                        className={`p-4 rounded-xl text-sm leading-relaxed ${
                          msg?.role === 'user'
                            ? 'bg-white/5 border border-white/10 text-white font-medium self-end'
                            : 'bg-teal-accent/10 border border-teal-accent/20 text-white/90 font-body'
                        }`}
                      >
                        <div className="text-[11px] font-mono mb-1 text-white/40 uppercase">
                          {msg?.role === 'user' ? 'You' : 'InsightFlow AI Analyst'}
                        </div>
                        {msg?.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* BOTTOM FIXED OMNI-BAR */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent z-30 pointer-events-none">

          <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 group/chips">
            {["Why did West sales drop?", "Show monthly profit trend", "Simulate 10% price increase"].map((q, idx) => (
              <button
                key={`chip-${idx}`}
                onClick={() => triggerAnalysis(q)}
                className="opacity-0 translate-y-2 pointer-events-none group-hover/chips:opacity-100 group-hover/chips:translate-y-0 group-hover/chips:pointer-events-auto transition-all duration-300 delay-500 group-hover/chips:delay-0 group-hover/chips:duration-200 flex-shrink-0 text-xs font-mono bg-[#171A25]/80 hover:bg-teal-accent/10 border border-white/10 hover:border-teal-accent/40 text-white/70 hover:text-teal-accent px-3 py-1.5 rounded-full backdrop-blur-md cursor-pointer"
              >
                💡 {q}
              </button>
            ))}
          </div>

          <div className="max-w-3xl w-full mx-auto bg-[#171A25]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 pointer-events-auto focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all hover:shadow-[0_0_30px_rgba(63,199,181,0.1)]">

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 border-b border-white/10">
                {files.map((file, idx) => (
                  <div key={`file-${idx}-${file.name}`} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg text-xs font-mono text-white/90 border border-white/10">
                    <span className="truncate max-w-[140px]">{file.name}</span>
                    <span className="text-[10px] text-white/40">({(file.size / 1024).toFixed(1)} KB)</span>
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
    </div>
  );
}

export default App;