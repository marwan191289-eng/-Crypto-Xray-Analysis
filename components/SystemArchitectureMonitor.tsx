
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Database, Activity, HardDrive, Server, 
  Brain, Repeat, Cpu, DatabaseZap, Globe, 
  Hexagon, Share2, Layers, GitCommit, Terminal
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface Props {
  t: any;
}

interface NodeMetrics {
  cpu: number;
  memory: number;
  network: number;
  latency: number;
  history: { val: number }[];
}

interface SystemNode {
  id: string;
  name: string;
  type: 'INFRA' | 'AI';
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  metrics: NodeMetrics;
  icon: any;
  details: string;
}

const generateInitialHistory = () => Array.from({ length: 20 }, () => ({ val: 30 + Math.random() * 40 }));

const SystemArchitectureMonitor: React.FC<Props> = ({ t }) => {
  const [nodes, setNodes] = useState<Record<string, SystemNode>>({
    api: { 
      id: 'api', name: 'API Gateway', type: 'INFRA', status: 'ONLINE', icon: Zap, details: 'FastAPI / Gunicorn',
      metrics: { cpu: 45, memory: 32, network: 120, latency: 12, history: generateInitialHistory() }
    },
    socket: { 
      id: 'socket', name: 'WebSocket Stream', type: 'INFRA', status: 'ONLINE', icon: Activity, details: 'AsyncIO / Redis PubSub',
      metrics: { cpu: 65, memory: 45, network: 850, latency: 5, history: generateInitialHistory() }
    },
    db: { 
      id: 'db', name: 'TimescaleDB', type: 'INFRA', status: 'ONLINE', icon: Database, details: 'PostgreSQL Cluster',
      metrics: { cpu: 28, memory: 75, network: 45, latency: 24, history: generateInitialHistory() }
    },
    cache: { 
      id: 'cache', name: 'Redis Layer', type: 'INFRA', status: 'ONLINE', icon: HardDrive, details: 'L1/L2 Caching',
      metrics: { cpu: 15, memory: 82, network: 210, latency: 1, history: generateInitialHistory() }
    },
    pytorch: { 
      id: 'pytorch', name: 'Inference Engine', type: 'AI', status: 'ONLINE', icon: Brain, details: 'PyTorch / CUDA',
      metrics: { cpu: 92, memory: 88, network: 15, latency: 140, history: generateInitialHistory() }
    },
    kafka: { 
      id: 'kafka', name: 'Event Bus', type: 'AI', status: 'ONLINE', icon: Repeat, details: 'Apache Kafka',
      metrics: { cpu: 35, memory: 60, network: 450, latency: 8, history: generateInitialHistory() }
    },
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [neuralGrid, setNeuralGrid] = useState<boolean[]>(Array(48).fill(false));

  // Simulation Engine
  useEffect(() => {
    const updateMetrics = (prev: NodeMetrics, volatility: number) => {
      const change = (Math.random() - 0.5) * volatility;
      let newCpu = Math.max(5, Math.min(100, prev.cpu + change));
      let newMem = Math.max(10, Math.min(98, prev.memory + (Math.random() - 0.5) * 2));
      const newHistory = [...prev.history.slice(1), { val: newCpu }];
      return {
        ...prev,
        cpu: newCpu,
        memory: newMem,
        network: Math.max(0, prev.network + (Math.random() - 0.5) * 50),
        latency: Math.max(1, prev.latency + (Math.random() - 0.5) * 2),
        history: newHistory
      };
    };

    const interval = setInterval(() => {
      setNodes(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const node = next[key];
          const volatility = node.type === 'AI' ? 15 : 8; 
          next[key] = {
            ...node,
            metrics: updateMetrics(node.metrics, volatility)
          };
        });
        return next;
      });

      setNeuralGrid(prev => prev.map(() => Math.random() > 0.85));

      if (Math.random() > 0.6) {
        const actions = ["Allocating Tensor Buffer", "Garbage Collection", "Shard Rebalancing", "Cache Hit", "Socket Ping", "Ingesting Tick", "Model Weight Sync", "Optimizing Gradient"];
        const sources = ["CORE", "NET", "AI", "DB"];
        const newLog = `[${new Date().toISOString().split('T')[1].slice(0,8)}] [${sources[Math.floor(Math.random()*sources.length)]}] ${actions[Math.floor(Math.random()*actions.length)]} <ID:${Math.floor(Math.random()*9999)}>`;
        setLogs(prev => [newLog, ...prev].slice(0, 7));
      }

    }, 800);

    return () => clearInterval(interval);
  }, []);

  const NodeVisualizer = ({ node }: { node: SystemNode }) => (
    <div className="relative group">
      <div className={`cyber-card rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${node.type === 'AI' ? 'border-indigo-500/20 hover:border-indigo-500/50' : 'border-white/5 hover:border-emerald-500/30'}`}>
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: node.type === 'AI' ? '#6366f1' : '#10b981' }} />
        
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
             <div className={`p-2.5 md:p-3 rounded-2xl border ${node.type === 'AI' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
               <node.icon className={`w-5 h-5 md:w-6 md:h-6 ${node.type === 'AI' ? 'text-indigo-400' : 'text-emerald-400'}`} />
             </div>
             <div>
               <h4 className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-white leading-none mb-1 md:mb-1.5">{node.name}</h4>
               <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5 md:gap-2">
                 <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${node.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                 {node.status}
               </span>
             </div>
          </div>
          <div className="text-right">
             <span className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-0.5 md:mb-1">Latency</span>
             <span className={`text-[10px] md:text-sm font-mono font-black ${node.metrics.latency > 100 ? 'text-amber-400' : 'text-white'}`}>{node.metrics.latency.toFixed(0)}ms</span>
          </div>
        </div>

        <div className="h-12 md:h-16 w-full mb-4 md:mb-6 opacity-80 mask-gradient-b">
           <ResponsiveContainer width="100%" height="100%" minHeight={40} minWidth={0}>
             <AreaChart data={node.metrics.history}>
               <defs>
                 <linearGradient id={`grad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor={node.type === 'AI' ? '#6366f1' : '#10b981'} stopOpacity={0.4}/>
                   <stop offset="95%" stopColor={node.type === 'AI' ? '#6366f1' : '#10b981'} stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Area 
                 type="monotone" 
                 dataKey="val" 
                 stroke={node.type === 'AI' ? '#6366f1' : '#10b981'} 
                 strokeWidth={2} 
                 fill={`url(#grad-${node.id})`} 
                 isAnimationActive={false}
               />
             </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 border-t border-white/5 pt-3 md:pt-4">
           <div>
              <div className="flex justify-between mb-1">
                 <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase">CPU</span>
                 <span className="text-[8px] md:text-[9px] font-mono font-bold text-white">{node.metrics.cpu.toFixed(0)}%</span>
              </div>
              <div className="h-0.5 md:h-1 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-500" style={{ width: `${node.metrics.cpu}%` }} />
              </div>
           </div>
           <div>
              <div className="flex justify-between mb-1">
                 <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase">MEM</span>
                 <span className="text-[8px] md:text-[9px] font-mono font-bold text-white">{node.metrics.memory.toFixed(0)}%</span>
              </div>
              <div className="h-0.5 md:h-1 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-500" style={{ width: `${node.metrics.memory}%` }} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      
      {/* SECTION 1: CLUSTER TOPOLOGY */}
      <div className="cyber-card rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] group-hover:scale-110 transition-transform -rotate-12">
          <Server className="w-64 md:w-96 h-64 md:h-96 text-emerald-400" />
        </div>

        <div className="flex items-center justify-between mb-10 md:mb-16 relative z-10 flex-wrap gap-6 md:gap-8">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="p-3 md:p-5 bg-emerald-500/10 rounded-2xl md:rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <DatabaseZap className="w-6 md:w-8 h-6 md:h-8 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-start">
              <h3 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.clusterTopology}</h3>
              <p className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.5em] mt-2 md:mt-3">{t.architectureSync} • {t.nodeLocation}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> System Healthy
                </span>
                <span className="text-[9px] md:text-xs font-mono font-black text-white">Uptime: 99.998%</span>
             </div>
             <div className="h-8 md:h-12 w-px bg-white/10 hidden sm:block"></div>
             <div className="bg-black/30 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-3 md:gap-4">
                <Globe className="w-4 md:w-5 h-4 md:h-5 text-slate-500" />
                <div>
                   <span className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest block">Region</span>
                   <span className="text-[9px] md:text-[11px] font-black text-white uppercase tracking-wider">eu-north-1</span>
                </div>
             </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12 items-center">
           <div className="hidden xl:flex flex-col items-center justify-center order-2 relative">
              <div className="absolute w-[200%] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent top-1/2 -translate-y-1/2"></div>
              <div className="absolute h-[200%] w-[2px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent left-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-20 w-48 h-48 rounded-full bg-slate-950/80 border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)] backdrop-blur-xl group/core">
                 <div className="absolute inset-2 rounded-full border border-emerald-500/20 border-dashed animate-[spin_20s_linear_infinite]"></div>
                 <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-pulse"></div>
                 <div className="text-center relative z-10">
                    <Hexagon className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80 group-hover/core:rotate-90 transition-transform duration-700" />
                    <span className="text-xl font-black text-white tracking-tighter block">G8 CORE</span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Master Node</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 md:gap-6 order-1">
              <NodeVisualizer node={nodes.api} />
              <NodeVisualizer node={nodes.socket} />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 md:gap-6 order-3">
              <NodeVisualizer node={nodes.db} />
              <NodeVisualizer node={nodes.cache} />
           </div>
        </div>
      </div>

      {/* SECTION 2: INTELLIGENCE HUB */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
         
         <div className="xl:col-span-8 cyber-card rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 relative overflow-hidden border border-white/5">
            <div className="absolute bottom-0 left-0 p-8 md:p-12 opacity-[0.03] rotate-12">
               <Brain className="w-64 md:w-96 h-64 md:h-96 text-indigo-400" />
            </div>

            <div className="flex items-center gap-4 md:gap-6 mb-10 md:mb-12 relative z-10">
               <div className="p-3 md:p-5 bg-indigo-500/10 rounded-2xl md:rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                 <Cpu className="w-6 md:w-8 h-6 md:h-8 text-indigo-400 animate-pulse" />
               </div>
               <div className="text-start">
                 <h3 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.intelHub}</h3>
                 <p className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.5em] mt-2 md:mt-3">{t.neuralGrid} • 128 Tensor Cores</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 relative z-10">
               <NodeVisualizer node={nodes.pytorch} />
               <NodeVisualizer node={nodes.kafka} />
            </div>

            {/* Neural Activation Grid - RESPONSIVE TWEAK */}
            <div className="mt-8 md:mt-10 bg-slate-950/50 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 border border-white/5 relative z-10">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                   <Share2 className="w-3.5 md:w-4 h-3.5 md:h-4 text-indigo-400" /> {t.neuralSynapseActivationMap}
                 </span>
                 <span className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Live Inference</span>
               </div>
               {/* 6 columns on mobile, 12 on desktop */}
               <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5 md:gap-2 h-auto md:h-24">
                 {neuralGrid.map((active, i) => (
                   <div 
                      key={i} 
                      className={`aspect-square md:aspect-auto rounded-sm transition-all duration-300 ${active ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1] scale-110' : 'bg-slate-800/50'}`} 
                    />
                 ))}
               </div>
            </div>
         </div>

         <div className="xl:col-span-4 cyber-card rounded-[2rem] md:rounded-[4rem] p-6 md:p-10 relative overflow-hidden flex flex-col border border-white/5">
            <div className="flex items-center gap-3 md:gap-4 mb-8">
               <Terminal className="w-5 md:w-6 h-5 md:h-6 text-slate-400" />
               <h3 className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.3em] md:tracking-[0.4em]">{t.recentLogs}</h3>
            </div>
            
            <div className="flex-1 bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 p-4 md:p-6 font-mono text-[8px] md:text-[10px] overflow-hidden relative shadow-inner min-h-[200px]">
               <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none mix-blend-overlay"></div>
               <div className="flex flex-col gap-3">
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-2 md:gap-3 animate-[slideIn_0.3s_ease-out] border-b border-white/5 pb-2 last:border-0">
                      <span className="text-emerald-500 font-bold shrink-0">{'>'}</span>
                      <span className="text-slate-300 break-all opacity-80 leading-relaxed">{log}</span>
                   </div>
                 ))}
               </div>
               <div className="mt-4 flex items-center gap-2 animate-pulse">
                  <span className="text-emerald-500 font-bold">{'>'}</span>
                  <div className="w-1.5 md:w-2 h-3 md:h-4 bg-emerald-500"></div>
               </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">
               <div className="flex items-center gap-1.5 md:gap-2">
                 <GitCommit className="w-2.5 md:w-3 h-2.5 md:h-3" />
                 <span>v8.2.4-stable</span>
               </div>
               <div className="flex items-center gap-1.5 md:gap-2">
                 <Layers className="w-2.5 md:w-3 h-2.5 md:h-3" />
                 <span>Shard: 0x4F</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SystemArchitectureMonitor;
