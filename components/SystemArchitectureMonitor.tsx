
import React, { useState, useEffect } from 'react';
import { 
  Zap, Database, Activity, HardDrive, Server, 
  Brain, Network, BarChart3, DatabaseZap, Repeat, Cpu
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  t: any;
}

const SystemArchitectureMonitor: React.FC<Props> = ({ t }) => {
  const [telemetry, setTelemetry] = useState<any>({
    api: { status: 'ONLINE', latency: 8, load: 12, details: 'FastAPI / Python', history: Array(10).fill(12) },
    socket: { status: 'ONLINE', latency: 2, load: 45, details: 'WebSockets / Async', history: Array(10).fill(45) },
    database: { status: 'ONLINE', latency: 45, load: 28, details: 'PostgreSQL + Timescale', history: Array(10).fill(28) },
    cache: { status: 'ONLINE', latency: 1, load: 8, details: 'Redis Core', history: Array(10).fill(8) },
    pytorch: { status: 'ONLINE', latency: 120, load: 68, details: 'PyTorch / TF Ensemble', history: Array(10).fill(68) },
    kafka: { status: 'ONLINE', latency: 5, load: 32, details: 'Kafka Message Bus', history: Array(10).fill(32) },
    pandas: { status: 'ONLINE', latency: 15, load: 24, details: 'NumPy / Pandas Vectorized', history: Array(10).fill(24) },
    talib: { status: 'ONLINE', latency: 3, load: 18, details: 'TA-Lib C-Engine', history: Array(10).fill(18) },
    uptime: '142:24:12',
    throughput: '2.4 GB/s'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev: any) => {
        const updateNode = (node: any) => {
          const newLoad = Math.max(5, node.load + (Math.random() - 0.5) * 10);
          return {
            ...node,
            latency: node.latency + (Math.random() - 0.5) * 2,
            load: newLoad,
            history: [...node.history.slice(1), newLoad]
          };
        };
        return {
          ...prev,
          api: updateNode(prev.api),
          socket: updateNode(prev.socket),
          pytorch: updateNode(prev.pytorch),
          database: updateNode(prev.database),
          cache: updateNode(prev.cache),
          kafka: updateNode(prev.kafka),
          pandas: updateNode(prev.pandas),
          talib: updateNode(prev.talib),
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const NodeCard = ({ node, icon: Icon, titleKey, colorClass = "text-accent" }: { node: any, icon: any, titleKey: string, colorClass?: string }) => (
    <div className="cyber-card rounded-[2rem] p-6 group transition-all relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-white/5 rounded-2xl ${colorClass} border border-white/10 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-start">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white leading-none mb-1.5">{t[titleKey] || titleKey}</h4>
            <span className="text-[9px] font-bold text-muted uppercase opacity-40 tracking-widest font-mono">{node.details}</span>
          </div>
        </div>
        <div className="status-pulse" />
      </div>
      
      <div className="h-10 w-full mb-6 opacity-30">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={node.history.map((h: any, i: any) => ({ i, v: h }))}>
            <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={2} dot={false} className={colorClass} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10 text-start border-t border-white/5 pt-4">
        <div>
          <span className="text-[9px] font-black text-muted uppercase tracking-widest opacity-50 block mb-1">{t.latency}</span>
          <p className="text-xs font-mono font-black text-accent">{node.latency.toFixed(1)}ms</p>
        </div>
        <div className="text-end">
          <span className="text-[9px] font-black text-muted uppercase tracking-widest opacity-50 block mb-1">{t.load}</span>
          <p className="text-xs font-mono font-black text-white">{node.load.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="cyber-card rounded-[4rem] p-12 group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform -rotate-6">
          <Server className="w-64 h-64 text-accent" />
        </div>
        
        <div className="flex items-center justify-between mb-12 relative z-10 flex-wrap gap-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-accent/10 rounded-3xl border border-accent/20 shadow-2xl">
              <DatabaseZap className="w-8 h-8 text-accent" />
            </div>
            <div className="text-start">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.clusterTopology}</h3>
              <p className="text-[11px] font-black text-muted uppercase tracking-[0.5em] mt-4 opacity-40 italic">{t.architectureSync}</p>
            </div>
          </div>
          <div className="flex gap-10 text-start">
             <div className="bg-black/40 px-8 py-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest block mb-1 opacity-50">{t.uptime}</span>
                <span className="text-lg font-mono font-black text-success text-glow-bull">{telemetry.uptime}</span>
             </div>
             <div className="bg-black/40 px-8 py-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest block mb-1 opacity-50">{t.throughput}</span>
                <span className="text-lg font-mono font-black text-accent text-glow-primary">{telemetry.throughput}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <NodeCard node={telemetry.api} icon={Zap} titleKey="gateway" />
          <NodeCard node={telemetry.socket} icon={Activity} titleKey="wsStream" colorClass="text-accent" />
          <NodeCard node={telemetry.database} icon={Database} titleKey="timescale" colorClass="text-gold" />
          <NodeCard node={telemetry.cache} icon={HardDrive} titleKey="redisCache" colorClass="text-accent" />
        </div>
      </div>

      <div className="cyber-card rounded-[4rem] p-12 group">
        <div className="absolute bottom-0 left-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform rotate-12">
          <Brain className="w-64 h-64 text-accent" />
        </div>

        <div className="flex items-center gap-6 mb-12 relative z-10">
          <div className="p-5 bg-accent/10 rounded-3xl border border-accent/20 shadow-2xl">
            <Cpu className="w-8 h-8 text-accent" />
          </div>
          <div className="text-start">
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.intelHub}</h3>
            <p className="text-[11px] font-black text-muted uppercase tracking-[0.5em] mt-4 opacity-40 italic">{t.neuralGrid}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <NodeCard node={telemetry.pytorch} icon={Brain} titleKey="mlModel" colorClass="text-danger" />
          <NodeCard node={telemetry.kafka} icon={Repeat} titleKey="dataPipeline" colorClass="text-accent" />
          <NodeCard node={telemetry.pandas} icon={Network} titleKey="computeUnit" colorClass="text-success" />
          <NodeCard node={telemetry.talib} icon={BarChart3} titleKey="analyticsCore" colorClass="text-gold" />
        </div>
      </div>
    </div>
  );
};

export default SystemArchitectureMonitor;
