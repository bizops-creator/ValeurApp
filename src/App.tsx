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
  FileAudio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { analyzeICP, generateDiagnostic, transcribeAndExtract, type CompanyData } from './services/geminiService';
import { ICP_CRITERIA, METHODOLOGY } from './constants';

type Section = 'dashboard' | 'icp-analyzer' | 'call-analysis' | 'knowledge';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-valeur-black overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-black/40 border-r border-white/5 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-valeur-green rounded flex items-center justify-center">
            <span className="text-valeur-black font-bold text-xl">V</span>
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight text-white">VALEUR BI</span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeSection === 'dashboard'} 
            onClick={() => setActiveSection('dashboard')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Target size={20} />} 
            label="Analisador ICP" 
            active={activeSection === 'icp-analyzer'} 
            onClick={() => setActiveSection('icp-analyzer')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Mic size={20} />} 
            label="Análise de Call" 
            active={activeSection === 'call-analysis'} 
            onClick={() => setActiveSection('call-analysis')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="Metodologia" 
            active={activeSection === 'knowledge'} 
            onClick={() => setActiveSection('knowledge')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-6 text-valeur-gray hover:text-white transition-colors flex justify-center"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto p-8 pt-12">
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <header className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Bem-vindo à <span className="text-valeur-green">Valeur BI</span>
        </h1>
        <p className="text-xl text-valeur-gray max-w-2xl leading-relaxed">
          Sua central de inteligência comercial. Analise leads, gere diagnósticos e domine a metodologia que escala operações B2B.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Leads Analisados" 
          value="128" 
          trend="+12% este mês" 
          icon={<Users className="text-valeur-green" />} 
        />
        <StatCard 
          title="Taxa de ICP" 
          value="64%" 
          trend="Estável" 
          icon={<Target className="text-valeur-champagne" />} 
        />
        <StatCard 
          title="Diagnósticos Gerados" 
          value="42" 
          trend="+5 novos" 
          icon={<FileText className="text-valeur-beige" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 space-y-6 neon-border">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-valeur-green" />
            Ação Rápida
          </h2>
          <p className="text-valeur-gray">
            Comece agora analisando um novo prospect para verificar se ele se encaixa no Perfil de Cliente Ideal da Valeur.
          </p>
          <button onClick={onStartAnalysis} className="btn-primary w-full">
            Iniciar Nova Análise
          </button>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <h3 className="text-xl font-bold text-white">Metodologia Valeur</h3>
          <ul className="space-y-4">
            {METHODOLOGY.pillars.map((pillar, i) => (
              <li key={i} className="flex gap-4">
                <div className="mt-1 w-5 h-5 rounded-full border border-valeur-green flex items-center justify-center text-[10px] font-bold text-valeur-green">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-valeur-beige">{pillar.name}</h4>
                  <p className="text-sm text-valeur-gray">{pillar.description}</p>
                </div>
              </li>
            ))}
          </ul>
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
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold text-white">Analisador de ICP</h2>
        <p className="text-valeur-gray">Verifique se o prospect atende aos critérios de qualificação da Valeur.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-valeur-gray">Nome da Empresa</label>
              <input 
                required
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-valeur-green outline-none transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-valeur-gray">Segmento</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-valeur-green outline-none transition-colors"
                value={formData.segment}
                onChange={e => setFormData({...formData, segment: e.target.value})}
              >
                <option value="">Selecione...</option>
                {ICP_CRITERIA.segments.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-valeur-gray">Nº de Funcionários</label>
              <input 
                required
                type="number" 
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-valeur-green outline-none transition-colors text-white"
                value={formData.employees || ''}
                onChange={e => setFormData({...formData, employees: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-valeur-gray">Faturamento Anual (R$)</label>
              <input 
                required
                type="number" 
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-valeur-green outline-none transition-colors text-white"
                value={formData.revenue || ''}
                onChange={e => setFormData({...formData, revenue: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-valeur-gray">Cargo do Contato</label>
              <input 
                required
                type="text" 
                placeholder="Ex: CEO, Diretor Comercial"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-valeur-green outline-none transition-colors text-white"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-valeur-gray">Nº de SDRs/Pré-vendedores</label>
              <input 
                required
                type="number" 
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-valeur-green outline-none transition-colors text-white"
                value={formData.sdrCount || ''}
                onChange={e => setFormData({...formData, sdrCount: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-valeur-gray">Nº de Closers/Vendedores</label>
              <input 
                required
                type="number" 
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-valeur-green outline-none transition-colors text-white"
                value={formData.closerCount || ''}
                onChange={e => setFormData({...formData, closerCount: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            Analisar Prospect
          </button>
        </form>

        <AnimatePresence>
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
              className="glass-panel p-8 space-y-8 neon-border"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Resultado da Análise</h3>
                <div className={cn(
                  "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                  result.isICP ? "bg-valeur-green/20 text-valeur-green" : "bg-red-500/20 text-red-500"
                )}>
                  {result.fitLevel} Fit
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="48" cy="48" r="40" 
                      className="fill-none stroke-white/10 stroke-[8]" 
                    />
                    <motion.circle 
                      cx="48" cy="48" r="40" 
                      className="fill-none stroke-valeur-green stroke-[8]" 
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * result.score) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-white">{result.score}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-lg font-semibold text-valeur-beige">Score de Qualificação</div>
                  <p className="text-sm text-valeur-gray">Baseado nos critérios de nicho, faturamento e decisores.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-valeur-gray uppercase tracking-wider">Por que?</h4>
                <ul className="space-y-2">
                  {result.reasons.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-valeur-beige">
                      <CheckCircle2 size={16} className="text-valeur-green mt-0.5 shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-valeur-gray uppercase tracking-wider">Recomendações</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-valeur-gray">
                      <AlertCircle size={16} className="text-valeur-champagne mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold text-white">Análise de Call</h2>
        <p className="text-valeur-gray">Transcreva e extraia dados de qualificação automaticamente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audio Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Mic className="text-valeur-green" size={24} />
              Upload da Gravação
            </h3>
            <p className="text-sm text-valeur-gray">
              Suba a gravação da call para transcrição automática e preenchimento do formulário de qualificação.
            </p>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-valeur-green/50 transition-all cursor-pointer group bg-white/5"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAudioUpload}
                accept="audio/*,video/mp4,video/x-m4v,video/*"
                className="hidden"
              />
              <div className="w-16 h-16 bg-valeur-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-valeur-green" size={32} />
              </div>
              <h4 className="text-white font-bold">Clique para subir</h4>
              <p className="text-xs text-valeur-gray mt-2">MP3, WAV, M4A, MP4 (Max 25MB)</p>
            </div>

            {audioLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-valeur-gray">
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={14} />
                    Analisando call com Gemini 3.1 Pro...
                  </span>
                  <span>IA em ação</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="h-full bg-valeur-green"
                  />
                </div>
                <p className="text-[10px] text-valeur-gray italic text-center">
                  Isso pode levar até 1 minuto dependendo do tamanho do vídeo.
                </p>
              </div>
            )}

            {audioError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0" />
                {audioError}
              </div>
            )}
          </div>
        </div>

        {/* Audio Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!audioResult && !audioLoading && (
            <div className="glass-panel p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <FileAudio className="text-valeur-gray" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Aguardando Gravação</h3>
              <p className="text-valeur-gray">Suba um arquivo de áudio para ver a transcrição e o formulário preenchido.</p>
            </div>
          )}

          {audioResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary & Transcription */}
              <div className="glass-panel p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Resumo da Call</h3>
                  <div className="flex items-center gap-2 text-valeur-green text-xs font-mono">
                    <div className="w-2 h-2 bg-valeur-green rounded-full animate-pulse" />
                    PROCESSADO POR IA
                  </div>
                </div>
                <p className="text-valeur-gray leading-relaxed italic border-l-2 border-valeur-green pl-4">
                  "{audioResult.summary}"
                </p>
                
                <details className="group">
                  <summary className="text-sm font-bold text-valeur-green cursor-pointer flex items-center gap-2 list-none">
                    <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                    Ver Transcrição Completa
                  </summary>
                  <div className="mt-4 p-4 bg-black/30 rounded-xl text-sm text-valeur-gray leading-relaxed max-h-60 overflow-y-auto font-mono">
                    {audioResult.transcription}
                  </div>
                </details>
              </div>

              {/* Extracted Form */}
              <div className="glass-panel p-8 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-valeur-green" size={24} />
                  Formulário de Qualificação Extraído
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(audioResult.formData).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-valeur-gray font-bold">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <div className="text-sm text-white bg-white/5 p-2 rounded border border-white/5">
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
