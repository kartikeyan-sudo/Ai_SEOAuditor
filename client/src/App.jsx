import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Search, Sparkles, CheckCircle2, Server, Globe, 
  AlertTriangle, Clock, Link2, Image, FileText, Code2, AlertCircle, ArrowRight, RefreshCw, XCircle, Sun, Moon, Check, Info, ShieldAlert, Cpu, Download
} from 'lucide-react';
import { auditService } from './services/api';
import BackgroundCanvas from './components/BackgroundCanvas';
import { downloadPdfReport } from './utils/pdfExporter';

export default function App() {
  // Set default theme to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('seo_auditor_theme') || 'light';
  });

  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [activeTab, setActiveTab] = useState('issues'); // 'issues' | 'passed' | 'facts'

  // Apply theme class strictly to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('seo_auditor_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const data = await auditService.checkHealth();
        setHealth(data);
      } catch (err) {
        console.error('Health check failed:', err);
        setHealth({ status: 'error', error: err.message });
      }
    }
    checkBackendHealth();
  }, []);

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setAuditResult(null);

    try {
      setLoadingStep('Fetching webpage HTML & checking crawlability...');
      await new Promise(r => setTimeout(r, 300));

      setLoadingStep('Evaluating 25+ technical & on-page SEO rules...');
      const res = await auditService.createAudit(urlInput);

      if (res.success) {
        setAuditResult(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to complete audit');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Website could not be reached';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handlePdfDownload = async () => {
    if (!auditResult) return;
    setDownloadingPdf(true);
    try {
      await downloadPdfReport(auditResult);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert(`Could not generate PDF report: ${err.message || 'Unknown error'}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getScoreBadgeStyle = (score) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30';
    if (score >= 75) return 'text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/30';
    if (score >= 50) return 'text-amber-800 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30';
    return 'text-rose-800 bg-rose-100 border-rose-300 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30';
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40">Critical</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30">High</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">Medium</span>;
      case 'low':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30">Low</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Info</span>;
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans flex flex-col relative transition-colors duration-300 ${
      isDark ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Three.js Interactive Background */}
      <BackgroundCanvas theme={theme} />

      {/* Website Watermark Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-5 dark:opacity-10 select-none">
        <span className="text-4xl sm:text-7xl font-black uppercase tracking-widest -rotate-12 text-slate-900 dark:text-white whitespace-nowrap">
          AI SEO Auditor by Mr. Zero
        </span>
      </div>

      {/* Navigation Header */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-[#090d16]/85 text-white' : 'border-slate-200 bg-white/95 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                AI SEO Auditor
              </span>
              <span className={`hidden sm:inline-block ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                by Mr. Zero
              </span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Backend Health Status */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>API:</span>
              {loadingHealth ? (
                <span className="text-yellow-600 animate-pulse">Checking...</span>
              ) : health?.status === 'ok' ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              ) : (
                <span className="text-rose-600 font-bold">Offline</span>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-8 sm:mb-12">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold mb-4 shadow-xs ${
            isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>AI SEO Auditor by Mr. Zero</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Instant SEO Audit & Health Report
          </h1>

          <p className={`text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium ${
            isDark ? 'text-slate-400' : 'text-slate-700'
          }`}>
            Analyze webpage HTML, title tags, meta descriptions, image accessibility, canonical tags, and crawlability rules in seconds.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAuditSubmit} className="w-full max-w-2xl mb-8">
          <div className="relative flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className={`w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border text-sm sm:text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 shadow-xl' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-md'
                }`}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Audit Website</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Indicator */}
        {loading && (
          <div className={`w-full max-w-2xl p-6 rounded-2xl border shadow-xl text-center animate-pulse mb-8 ${
            isDark ? 'bg-slate-900/90 border-blue-500/30 text-white' : 'bg-white border-blue-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-center gap-3 text-blue-600 font-bold mb-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{loadingStep}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Extracting DOM elements, fetching robots.txt, and computing score metrics...</p>
          </div>
        )}

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="w-full max-w-2xl p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-200 mb-8 flex items-start gap-4 shadow-md">
            <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900 dark:text-rose-300 text-sm mb-1">Audit Failed</h4>
              <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Audit Dashboard Report Output */}
        {auditResult && (
          <div className="w-full space-y-6 sm:space-y-8 transition-all">

            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  HTTP {auditResult.page.statusCode} OK
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {auditResult.page.responseTime} ms
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Download PDF Button */}
                <button
                  onClick={handlePdfDownload}
                  disabled={downloadingPdf}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {downloadingPdf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Report</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => { setAuditResult(null); setUrlInput(''); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  New Audit
                </button>
              </div>
            </div>

            {/* Overall Score Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                
                {/* Score Gauge Badge */}
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full md:w-auto">
                  <div className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${getScoreBadgeStyle(auditResult.audit.score)} shadow-md shrink-0`}>
                    <span className="text-4xl font-black">
                      {auditResult.audit.score}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-widest mt-0.5">out of 100</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">SEO Health Score</span>
                    <h2 className={`text-2xl sm:text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {auditResult.audit.interpretation}
                    </h2>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate max-w-md font-bold">{auditResult.finalUrl}</p>
                  </div>
                </div>

                {/* Summary Stat Pills */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center w-full md:w-auto">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 block">{auditResult.audit.summary.passed}</span>
                    <span className="text-[10px] text-emerald-900 dark:text-emerald-300 uppercase font-bold">Passed</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                    <span className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-400 block">{auditResult.audit.summary.warnings}</span>
                    <span className="text-[10px] text-amber-900 dark:text-amber-300 uppercase font-bold">Warnings</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20">
                    <span className="text-xl sm:text-2xl font-black text-rose-800 dark:text-rose-400 block">{auditResult.audit.summary.failed}</span>
                    <span className="text-[10px] text-rose-900 dark:text-rose-300 uppercase font-bold">Failed</span>
                  </div>
                </div>

              </div>

              {/* Category Breakdown Grid */}
              <div className="pt-6">
                <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Category Score Breakdown</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries({
                    'Technical SEO': auditResult.audit.categories.technical,
                    'On-Page SEO': auditResult.audit.categories.onPage,
                    'Content Structure': auditResult.audit.categories.content,
                    'Images & Links': auditResult.audit.categories.mediaLinks,
                    'Crawlability': auditResult.audit.categories.crawlability,
                    'Social Metadata': auditResult.audit.categories.social,
                  }).map(([name, cat]) => (
                    <div key={name} className={`p-3.5 rounded-2xl border ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 block truncate font-bold mb-1">{name}</span>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{cat.score}</span>
                        <span className="text-xs text-slate-500 font-mono font-bold">/ {cat.maxScore}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((cat.score / cat.maxScore) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('issues')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'issues' 
                    ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400 font-extrabold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Issues & Action Plan ({auditResult.audit.issues.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('passed')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'passed' 
                    ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400 font-extrabold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Passed Checks ({auditResult.audit.passedChecks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('facts')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'facts' 
                    ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400 font-extrabold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Page Technical Signals</span>
              </button>
            </div>

            {/* Tab Panel: Issues & Recommendations */}
            {activeTab === 'issues' && (
              <div className="space-y-4">
                {auditResult.audit.issues.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-950 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-500 mx-auto mb-2" />
                    <p className="font-extrabold text-base">Zero Issues Detected!</p>
                    <p className="text-xs font-semibold mt-1">This webpage passed all automated SEO rule checks cleanly.</p>
                  </div>
                ) : (
                  auditResult.audit.issues.map((rule) => (
                    <div key={rule.id} className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(rule.severity)}
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{rule.name}</h4>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">[{rule.category}]</span>
                      </div>

                      <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}>
                        <span className="text-[10px] uppercase font-black text-slate-600 dark:text-slate-400 tracking-wider block">Detected Fact</span>
                        <p className="leading-relaxed font-bold">{rule.message}</p>
                      </div>

                      {rule.recommendation && (
                        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 dark:bg-blue-950/40 dark:border-blue-500/20 dark:text-blue-100 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-black text-blue-800 dark:text-blue-400 tracking-wider block flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Action Recommendation
                          </span>
                          <p className="leading-relaxed font-semibold">{rule.recommendation}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab Panel: Passed Checks */}
            {activeTab === 'passed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {auditResult.audit.passedChecks.map((rule) => (
                  <div key={rule.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-200">{rule.name}</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5 font-semibold">{rule.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab Panel: Technical Signals */}
            {activeTab === 'facts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">Page & HTTP Fetch Stats</h4>
                  <div className="space-y-1.5 font-mono text-slate-900 dark:text-slate-300">
                    <div>Status Code: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{auditResult.page.statusCode}</span></div>
                    <div>Response Time: <span className="text-blue-700 dark:text-blue-400 font-extrabold">{auditResult.page.responseTime} ms</span></div>
                    <div>Content Type: <span className="text-slate-700 dark:text-slate-400 font-bold">{auditResult.page.contentType}</span></div>
                    <div>JS-Rendered Warning: <span className={auditResult.page.isJsRendered ? 'text-amber-800 dark:text-amber-400 font-extrabold' : 'text-slate-700'}>{String(auditResult.page.isJsRendered)}</span></div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">Crawlability Assets</h4>
                  <div className="space-y-1.5 font-mono text-slate-900 dark:text-slate-300">
                    <div>robots.txt: <span className={auditResult.audit.crawlData.robotsTxt?.exists ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-amber-800 dark:text-amber-400 font-extrabold'}>{auditResult.audit.crawlData.robotsTxt?.exists ? 'Available (200 OK)' : 'Missing'}</span></div>
                    <div>sitemap.xml: <span className={auditResult.audit.crawlData.sitemapXml?.exists ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-amber-800 dark:text-amber-400 font-extrabold'}>{auditResult.audit.crawlData.sitemapXml?.exists ? 'Available (200 OK)' : 'Missing'}</span></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Floating Website Watermark Badge (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 border border-slate-700 dark:border-slate-200 text-[11px] font-bold shadow-2xl backdrop-blur-md flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
        <span>AI SEO Auditor by Mr. Zero</span>
      </div>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs text-slate-600 dark:text-slate-400 font-semibold transition-colors ${
        isDark ? 'border-slate-800/80 bg-[#090d16]' : 'border-slate-200 bg-white'
      }`}>
        <p>AI SEO Auditor by Mr. Zero &copy; 2026 — Automated Technical & SEO Analysis Platform</p>
      </footer>
    </div>
  );
}
