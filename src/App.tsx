/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  BookOpen, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  Target,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Menu,
  X,
  Mic,
  Upload,
  Play,
  FileAudio,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight,
  TrendingDown,
  Activity,
  Award,
  Clock,
  Sparkles,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from './lib/utils';
import { analyzeICP, generateDiagnostic, transcribeAndExtract, type CompanyData } from './services/geminiService';
import { ICP_CRITERIA, METHODOLOGY } from './constants';

// Hook for 3C Plus Stats
function use3CStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/3c/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Erro ao buscar stats da 3C:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
}

type Section = 'dashboard' | 'icp-analyzer' | 'call-analysis' | 'knowledge';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-valeur-black overflow-hidden relative">
      <div className="atmosphere" />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-black/20 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 flex flex-col z-50",
          isSidebarOpen ? "w-72" : "w-24"
        )}
      >
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-valeur-green rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.4)]">
            <span className="text-valeur-black font-black text-2xl">V</span>
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter text-white leading-none">VALEUR</span>
              <span className="text-[10px] text-valeur-green font-bold tracking-[0.3em] uppercase">Intelligence</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-6 py-8 space-y-3">
          <NavItem 
            icon={<LayoutDashboard size={22} />} 
            label="Dashboard" 
            active={activeSection === 'dashboard'} 
            onClick={() => setActiveSection('dashboard')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Target size={22} />} 
            label="Analisador ICP" 
            active={activeSection === 'icp-analyzer'} 
            onClick={() => setActiveSection('icp-analyzer')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Mic size={22} />} 
            label="Análise de Call" 
            active={activeSection === 'call-analysis'} 
            onClick={() => setActiveSection('call-analysis')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<BookOpen size={22} />} 
            label="Metodologia" 
            active={activeSection === 'knowledge'} 
            onClick={() => setActiveSection('knowledge')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        {isSidebarOpen && (
          <div className="px-6 py-8 border-t border-white/5 space-y-6">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-valeur-green to-valeur-champagne flex items-center justify-center text-valeur-black font-bold">
                BV
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">BizOps Valeur</span>
                <span className="text-[10px] text-valeur-gray">Nível 4 • Hunter</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-2">
              <button className="text-valeur-gray hover:text-white transition-colors"><Settings size={18} /></button>
              <button className="text-valeur-gray hover:text-red-400 transition-colors"><LogOut size={18} /></button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-8 text-valeur-gray hover:text-white transition-colors flex justify-center border-t border-white/5"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto p-10 pt-16">
          <AnimatePresence mode="wait">
            {activeSection === 'dashboard' && <Dashboard key="dashboard" onStartAnalysis={() => setActiveSection('icp-analyzer')} />}
            {activeSection === 'icp-analyzer' && <ICPAnalyzer key="icp" />}
            {activeSection === 'call-analysis' && <CallAnalysis key="call" />}
            {activeSection === 'knowledge' && <KnowledgeBase key="kb" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-valeur-green/10 text-valeur-green" 
          : "text-valeur-gray hover:bg-white/5 hover:text-white"
      )}
    >
      <div className={cn("transition-transform", active && "scale-110")}>
        {icon}
      </div>
      {!collapsed && (
        <span className="font-medium text-sm tracking-wide">{label}</span>
      )}
      {active && !collapsed && (
        <motion.div 
          layoutId="active-indicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-valeur-green shadow-[0_0_8px_rgba(0,255,0,0.5)]" 
        />
      )}
    </button>
  );
}

function Dashboard({ onStartAnalysis }: { onStartAnalysis: () => void, key?: string }) {
  const { stats, loading: statsLoading } = use3CStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-valeur-green text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={14} />
            Sua Central de Inteligência
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
            Olá, <span className="text-valeur-green">Hunter.</span>
          </h1>
          <p className="text-lg text-valeur-gray max-w-xl font-medium">
            Pronto para qualificar os melhores prospects do dia?
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-panel px-6 py-3 flex items-center gap-4 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-valeur-green animate-pulse" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-valeur-gray font-bold uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} className="text-valeur-green" />
                Meta 3C Plus
              </span>
              <span className="text-sm font-black text-white">{stats?.callsToday || 0}/150 Calls</span>
              <span className="text-[8px] text-valeur-green/50 font-medium uppercase tracking-tighter">
                {stats?.lastEvent || 'Conectado'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-valeur-green/30 flex items-center justify-center text-[10px] font-black text-valeur-green relative">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * (stats?.goalReached || 0)) / 100}
                  className="text-valeur-green transition-all duration-1000"
                />
              </svg>
              {stats?.goalReached || 0}%
            </div>
          </div>
        </div>
      </header>

      <div className="bento-grid">
        {/* Main Action Card */}
        <div className="bento-item col-span-2 row-span-2 bg-gradient-to-br from-valeur-green/20 to-transparent border-valeur-green/30 group">
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 bg-valeur-green rounded-2xl flex items-center justify-center text-valeur-black shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Target size={24} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              Analisador de ICP <br/> Inteligente
            </h2>
            <p className="text-valeur-gray text-sm max-w-xs font-medium">
              Use nossa IA treinada na metodologia Valeur para qualificar leads em segundos.
            </p>
          </div>
          <button onClick={onStartAnalysis} className="btn-primary w-full relative z-10">
            Nova Análise
          </button>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-valeur-green/10 rounded-full blur-3xl group-hover:bg-valeur-green/20 transition-colors duration-500" />
        </div>

        {/* Stats Cards */}
        <div className="bento-item col-span-1 row-span-1 group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-valeur-green/10 transition-colors">
              <Users className="text-valeur-green" size={20} />
            </div>
            <span className="text-[10px] font-black text-valeur-green">+12%</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">128</div>
            <div className="text-[10px] font-bold text-valeur-gray uppercase tracking-widest">Leads Totais</div>
          </div>
        </div>

        <div className="bento-item col-span-1 row-span-1 group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-valeur-champagne/10 transition-colors">
              <Activity className="text-valeur-champagne" size={20} />
            </div>
            <span className="text-[10px] font-black text-valeur-gray uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-valeur-green rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats?.activeCalls || 0}</div>
            <div className="text-[10px] font-bold text-valeur-gray uppercase tracking-widest">Calls Ativas (3C)</div>
          </div>
        </div>

        {/* Diagnostic Card */}
        <div className="bento-item col-span-2 row-span-1 flex-row items-center gap-6 group">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
            <FileText className="text-valeur-beige" size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Diagnósticos</h3>
            <p className="text-xs text-valeur-gray font-medium">42 relatórios gerados com a metodologia Valeur.</p>
            <div className="flex gap-1 mt-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-1 w-8 bg-valeur-green/20 rounded-full overflow-hidden">
                  <div className="h-full bg-valeur-green w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Methodology Quick View */}
        <div className="bento-item col-span-2 row-span-2 bg-black/40">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="text-valeur-champagne" size={20} />
                Pilares Valeur
              </h3>
              <button className="text-[10px] font-black text-valeur-gray hover:text-white uppercase tracking-widest transition-colors">Ver Todos</button>
            </div>
            <div className="space-y-4">
              {METHODOLOGY.pillars.slice(0, 3).map((pillar, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-valeur-champagne group-hover:bg-valeur-champagne group-hover:text-valeur-black transition-all">
                    0{i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{pillar.name}</h4>
                    <p className="text-[10px] text-valeur-gray font-medium line-clamp-1">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bento-item col-span-2 row-span-1 flex-row items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-valeur-green/10 rounded-full flex items-center justify-center">
              <Mic className="text-valeur-green" size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Última Call Analisada</div>
              <div className="text-[10px] text-valeur-gray font-medium">Empresa Solar Tech • Há 2 horas</div>
            </div>
          </div>
          <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Performance Chart Section */}
        <div className="bento-item col-span-4 row-span-2 bg-black/40 border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="text-valeur-green" size={20} />
                    Performance 3C Plus
                  </h3>
                  <p className="text-[10px] text-valeur-gray font-medium uppercase tracking-widest">Calls finalizadas por hora</p>
                </div>
              </div>
              
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.hourlyData || []}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FF00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00FF00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#8E9299" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#8E9299' }}
                    />
                    <YAxis 
                      stroke="#8E9299" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#8E9299' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#050505', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#00FF00' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="calls" 
                      stroke="#00FF00" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCalls)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 border-l border-white/5 pl-8 space-y-6">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-valeur-green" />
                  Log de Eventos
                </h4>
                <p className="text-[10px] text-valeur-gray font-medium">Últimas 5 atividades do Webhook</p>
              </div>

              <div className="space-y-3">
                {stats?.recentEvents?.length > 0 ? (
                  stats.recentEvents.map((ev: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-valeur-green uppercase tracking-tighter">{ev.event}</span>
                        <span className="text-[8px] text-valeur-gray">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center space-y-2 opacity-30">
                    <Clock size={24} className="text-valeur-gray" />
                    <span className="text-[10px] font-bold text-valeur-gray uppercase tracking-widest">Aguardando dados...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Insights */}
        <div className="bento-item col-span-2 row-span-1 flex-row items-center gap-6 group">
          <div className="w-16 h-16 bg-valeur-green/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-valeur-green/10 transition-colors">
            <Sparkles className="text-valeur-green" size={24} />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Insight do Dia</h3>
            <p className="text-sm text-valeur-beige leading-snug font-medium">
              "Empresas com mais de 5 SDRs no segmento de Tecnologia têm 40% mais chance de fechar com a Valeur."
            </p>
          </div>
          <div className="text-[10px] font-black text-valeur-green bg-valeur-green/10 px-3 py-1 rounded-full uppercase tracking-widest">
            IA Insight
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-valeur-gray uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="text-xs text-valeur-green font-medium">{trend}</div>
      </div>
    </div>
  );
}

function ICPAnalyzer() {
  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    segment: '',
    employees: 0,
    revenue: 0,
    role: '',
    sdrCount: 0,
    closerCount: 0,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (formData.revenue <= 0 || formData.employees <= 0) {
        throw new Error("Por favor, insira valores válidos para faturamento e funcionários.");
      }
      const analysis = await analyzeICP(formData);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro inesperado na análise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-valeur-green text-[10px] font-black uppercase tracking-[0.3em]">
          <Target size={14} />
          Qualificação de Leads
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter">Analisador de ICP</h2>
        <p className="text-valeur-gray font-medium">Verifique se o prospect atende aos critérios de qualificação da Valeur.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-5 glass-panel p-10 space-y-8 neon-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-valeur-green/5 rounded-full blur-3xl group-hover:bg-valeur-green/10 transition-colors" />
          
          <div className="grid grid-cols-1 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">Nome da Empresa</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Valeur Consultoria"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-valeur-green outline-none transition-all text-white placeholder:text-white/20"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">Segmento</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-valeur-green outline-none transition-all text-white appearance-none cursor-pointer"
                  value={formData.segment}
                  onChange={e => setFormData({...formData, segment: e.target.value})}
                >
                  <option value="" className="bg-valeur-black">Selecione...</option>
                  {ICP_CRITERIA.segments.map(s => <option key={s} value={s} className="bg-valeur-black">{s}</option>)}
                  <option value="Outro" className="bg-valeur-black">Outro</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">Funcionários</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-valeur-green outline-none transition-all text-white"
                  value={formData.employees || ''}
                  onChange={e => setFormData({...formData, employees: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">Faturamento Anual (R$)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-valeur-green font-bold text-sm">R$</span>
                <input 
                  required
                  type="number" 
                  min="1"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3 focus:border-valeur-green outline-none transition-all text-white"
                  value={formData.revenue || ''}
                  onChange={e => setFormData({...formData, revenue: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">Cargo do Contato</label>
              <input 
                required
                type="text" 
                placeholder="Ex: CEO, Diretor Comercial"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-valeur-green outline-none transition-all text-white placeholder:text-white/20"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">SDRs</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-valeur-green outline-none transition-all text-white"
                  value={formData.sdrCount || ''}
                  onChange={e => setFormData({...formData, sdrCount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">Closers</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-valeur-green outline-none transition-all text-white"
                  value={formData.closerCount || ''}
                  onChange={e => setFormData({...formData, closerCount: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3 relative z-10">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            Executar Análise de ICP
          </button>
        </form>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result && !error && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-16 text-center space-y-6 border-dashed border-white/10"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Target className="text-valeur-gray/30" size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Aguardando Dados</h3>
                  <p className="text-sm text-valeur-gray max-w-xs mx-auto">Preencha as informações ao lado para que nossa IA gere o diagnóstico de qualificação.</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-16 text-center space-y-8"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-valeur-green/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-valeur-green rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="text-valeur-green animate-pulse" size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Analisando Prospect...</h3>
                  <p className="text-sm text-valeur-gray">Cruzando dados com a metodologia Valeur.</p>
                </div>
              </motion.div>
            )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 border-red-500/30 bg-red-500/5 flex items-start gap-4"
            >
              <AlertCircle className="text-red-500 shrink-0" size={24} />
              <div className="space-y-1">
                <h4 className="font-bold text-white">Erro na Análise</h4>
                <p className="text-sm text-valeur-gray">{error}</p>
                <p className="text-xs text-valeur-gray mt-2 italic">
                  Dica: Verifique se a GEMINI_API_KEY está configurada corretamente no menu de Settings.
                </p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-8 space-y-8 neon-border relative overflow-hidden"
            >
              {/* Background decorative element */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-valeur-green/5 rounded-full blur-3xl" />
              
              <div className="flex justify-between items-center relative z-10">
                <h3 className="text-2xl font-bold text-white tracking-tight">Análise de Qualificação</h3>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg",
                  result.isICP 
                    ? "bg-valeur-green/20 text-valeur-green border border-valeur-green/30" 
                    : "bg-red-500/20 text-red-500 border border-red-500/30"
                )}>
                  {result.fitLevel} Fit
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 py-4 relative z-10">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(0,255,0,0.2)]">
                    <circle 
                      cx="64" cy="64" r="56" 
                      className="fill-none stroke-white/5 stroke-[10]" 
                    />
                    <motion.circle 
                      cx="64" cy="64" r="56" 
                      className={cn(
                        "fill-none stroke-[10] stroke-linecap-round",
                        result.score >= 70 ? "stroke-valeur-green" : result.score >= 40 ? "stroke-valeur-champagne" : "stroke-red-500"
                      )}
                      strokeDasharray="351.85"
                      initial={{ strokeDashoffset: 351.85 }}
                      animate={{ strokeDashoffset: 351.85 - (351.85 * result.score) / 100 }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white leading-none">{result.score}</span>
                    <span className="text-[10px] text-valeur-gray font-bold uppercase tracking-tighter">Score</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                      <Activity size={20} className="text-valeur-green" />
                      Diagnóstico de Perfil
                    </div>
                    <p className="text-sm text-valeur-gray leading-relaxed">
                      Lead analisado com base em faturamento, estrutura comercial e aderência ao nicho Valeur.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-mono text-valeur-beige">
                      ICP: {result.isICP ? "SIM" : "NÃO"}
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-mono text-valeur-beige">
                      SCORE: {result.score}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <ShieldCheck size={18} className="text-valeur-green" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Por que este score?</h4>
                  </div>
                  <ul className="grid grid-cols-1 gap-3">
                    {result.reasons.map((reason: string, i: number) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-valeur-green/30 transition-colors group"
                      >
                        <div className="mt-0.5 p-1 bg-valeur-green/10 rounded-lg group-hover:bg-valeur-green/20 transition-colors">
                          {i % 3 === 0 ? <Zap size={14} className="text-valeur-green" /> : 
                           i % 3 === 1 ? <TrendingUp size={14} className="text-valeur-green" /> : 
                           <CheckCircle2 size={14} className="text-valeur-green" />}
                        </div>
                        <span className="text-sm text-valeur-beige leading-snug">{reason}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Info size={18} className="text-valeur-champagne" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Recomendações Estratégicas</h4>
                  </div>
                  <ul className="grid grid-cols-1 gap-3">
                    {result.recommendations.map((rec: string, i: number) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (i + result.reasons.length) * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-valeur-champagne/30 transition-colors group"
                      >
                        <div className="mt-0.5 p-1 bg-valeur-champagne/10 rounded-lg group-hover:bg-valeur-champagne/20 transition-colors">
                          {i % 2 === 0 ? <ArrowRight size={14} className="text-valeur-champagne" /> : 
                           <AlertCircle size={14} className="text-valeur-champagne" />}
                        </div>
                        <span className="text-sm text-valeur-gray leading-snug">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Technical footer */}
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-valeur-gray uppercase tracking-tighter">
                <span>Valeur Intelligence Engine v2.4</span>
                <span>Timestamp: {new Date().toLocaleTimeString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
  );
}

function CallAnalysis() {
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<any>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (Gemini inlineData limit is roughly 20MB)
    if (file.size > 25 * 1024 * 1024) {
      setAudioError("O arquivo é muito grande. O limite é 25MB para vídeos/áudios.");
      return;
    }

    setAudioLoading(true);
    setAudioError(null);
    setAudioResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const mimeType = file.type || 'audio/mpeg';
          
          console.log("Iniciando transcrição com MimeType:", mimeType);
          const analysis = await transcribeAndExtract(base64, mimeType);
          
          if (!analysis || !analysis.formData) {
            throw new Error("A IA processou o arquivo mas não conseguiu extrair os dados do formulário. Tente um áudio mais claro.");
          }

          console.log("Análise recebida com sucesso:", analysis);
          setAudioResult(analysis);
          setAudioLoading(false);
        } catch (err: any) {
          console.error("Error in reader.onload:", err);
          setAudioError(err.message || "Erro ao processar o conteúdo do arquivo.");
          setAudioLoading(false);
        }
      };
      reader.onerror = () => {
        setAudioError("Erro ao ler o arquivo físico.");
        setAudioLoading(false);
      };
    } catch (err: any) {
      console.error("Error in handleAudioUpload:", err);
      setAudioError(err.message || "Erro ao iniciar o processamento.");
      setAudioLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-valeur-green text-[10px] font-black uppercase tracking-[0.3em]">
          <Mic size={14} />
          Inteligência de Conversação
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter">Análise de Call</h2>
        <p className="text-valeur-gray font-medium">Extraia dados estratégicos de reuniões comerciais automaticamente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="glass-panel p-10 space-y-8 neon-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-valeur-green/5 rounded-full blur-3xl group-hover:bg-valeur-green/10 transition-colors" />
            
            <div className="text-center space-y-4 relative z-10">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                <Upload className="text-valeur-green" size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Subir Gravação</h3>
                <p className="text-xs text-valeur-gray font-medium">Formatos aceitos: MP4, MP3, WAV</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <input 
                type="file" 
                accept="audio/*,video/mp4,video/x-m4v,video/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleAudioUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={audioLoading}
                className="btn-primary w-full flex items-center justify-center gap-3"
              >
                {audioLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                Selecionar Arquivo
              </button>
            </div>

            {audioLoading && (
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-[10px] text-valeur-gray font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={12} />
                    Processando...
                  </span>
                  <span>IA em ação</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="h-full bg-valeur-green shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                  />
                </div>
                <p className="text-[9px] text-valeur-gray italic text-center font-medium">
                  O Gemini 3.1 Pro está analisando cada detalhe da conversa.
                </p>
              </div>
            )}

            {audioError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold flex items-start gap-3 relative z-10">
                <AlertCircle size={16} className="shrink-0" />
                {audioError}
              </div>
            )}
          </div>

          {/* Waveform Visualizer Placeholder */}
          <div className="glass-panel p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-valeur-gray uppercase tracking-widest">Visualizador de Áudio</span>
              <Activity size={14} className="text-valeur-green" />
            </div>
            <div className="flex items-end gap-1 h-12">
              {[...Array(30)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: audioLoading ? [10, 40, 10] : 10 }}
                  transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                  className="flex-1 bg-valeur-green/30 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Audio Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!audioResult && !audioLoading && (
            <div className="glass-panel p-20 text-center space-y-6 border-dashed border-white/10 h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                <FileAudio className="text-valeur-gray/20" size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Aguardando Call</h3>
                <p className="text-sm text-valeur-gray max-w-xs mx-auto font-medium">Suba um arquivo para ver a transcrição e o formulário Hunter preenchido automaticamente.</p>
              </div>
            </div>
          )}

          {audioResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary & Transcription */}
              <div className="glass-panel p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-valeur-green to-transparent opacity-30" />
                
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white tracking-tight">Resumo Executivo</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-valeur-green/10 rounded-full text-[10px] font-black text-valeur-green uppercase tracking-widest border border-valeur-green/20">
                    <Sparkles size={12} />
                    Gemini 3.1 Pro
                  </div>
                </div>
                
                <div className="relative">
                  <MessageSquare className="absolute -left-2 -top-2 text-valeur-green/10" size={40} />
                  <p className="text-lg text-valeur-beige leading-relaxed font-medium pl-6 border-l-2 border-valeur-green/30 italic">
                    {audioResult.summary}
                  </p>
                </div>
                
                <details className="group">
                  <summary className="text-xs font-black text-valeur-green cursor-pointer flex items-center gap-2 list-none uppercase tracking-widest hover:opacity-80 transition-opacity">
                    <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                    Ver Transcrição Completa
                  </summary>
                  <div className="mt-6 p-6 bg-black/40 rounded-3xl text-xs text-valeur-gray leading-relaxed max-h-80 overflow-y-auto font-mono border border-white/5">
                    {audioResult.transcription}
                  </div>
                </details>
              </div>

              {/* Extracted Form */}
              <div className="glass-panel p-10 space-y-10 neon-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <FileText className="text-valeur-green" size={28} />
                    Formulário Hunter
                  </h3>
                  <button className="btn-secondary">Exportar para Kommo</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  {Object.entries(audioResult.formData).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-2 group">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-valeur-gray font-black group-hover:text-valeur-green transition-colors">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <div className="text-sm text-white bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all font-medium">
                        {value || "Não identificado"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function KnowledgeBase() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <header>
        <h2 className="text-3xl font-bold text-white">Base de Conhecimento</h2>
        <p className="text-valeur-gray">Explore os fundamentos da metodologia Valeur Consultoria.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-valeur-green flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-valeur-green" />
            Pilares da Operação
          </h3>
          <div className="space-y-4">
            {METHODOLOGY.pillars.map((p, i) => (
              <div key={i} className="glass-panel p-6 hover:bg-white/10 transition-colors cursor-default">
                <h4 className="font-bold text-lg text-white mb-2">{p.name}</h4>
                <p className="text-sm text-valeur-gray leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-bold text-valeur-champagne flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-valeur-champagne" />
            Frameworks & Técnicas
          </h3>
          <div className="space-y-4">
            {METHODOLOGY.frameworks.map((f, i) => (
              <div key={i} className="glass-panel p-6 hover:bg-white/10 transition-colors cursor-default">
                <h4 className="font-bold text-lg text-white mb-2">{f.name}</h4>
                <p className="text-sm text-valeur-gray leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
