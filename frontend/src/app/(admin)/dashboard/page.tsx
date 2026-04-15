"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Box, Activity, KeySquare, HardDrive, Shield } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NodeStats {
  generated: number;
  success: number;
  failed: number;
}

interface WorkerNode {
  id: number;
  proxyHost: string | null;
  ready: boolean;
  isFetching: boolean;
  isShuttingDown: boolean;
  stats: NodeStats;
}

interface ClusterStatus {
  queueLength: number;
  totalGenerated: number;
  totalSuccess: number;
  totalFailed: number;
  activeNodeCount: number;
  nodes: WorkerNode[];
}

export default function Dashboard() {
  const [status, setStatus] = useState<ClusterStatus | null>(null);

  const [resourceHistory, setResourceHistory] = useState<any[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/worker-api/cluster/status", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch("/worker-api/system/resources", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
           setResourceHistory(data);
        }
      }
    } catch(e) {}
  };

  useEffect(() => {
    fetchStatus();
    fetchResources();
    const timer = setInterval(fetchStatus, 3000);
    const resTimer = setInterval(fetchResources, 3000);
    return () => { clearInterval(timer); clearInterval(resTimer); };
  }, []);



  const handleRemoveNode = async (id: number) => {
    try {
      const res = await fetch(`/worker-api/cluster/nodes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        toast.success(`Shutdown signal sent to Node-${id}`);
        fetchStatus();
      } else {
        toast.error("Failed to terminate node");
      }
    } catch (e) {
      toast.error("Server error");
    }
  };
  const successRate = status?.totalGenerated === 0 
    ? 100 
    : Math.round(((status?.totalSuccess || 0) / ((status?.totalSuccess || 0) + (status?.totalFailed || 0) || 1)) * 100);

  return (
    <div className="flex-1 w-full space-y-4 p-4 md:p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">仪表盘总览</h2>
          <p className="text-muted-foreground">统揽集群打码核心指标与运算节点状态监控</p>
        </div>
      </div>
      
      {!status ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Activity className="h-6 w-6 text-muted-foreground animate-pulse" />
            <p className="text-sm font-medium text-muted-foreground">正在连接节点集群...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Section */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-minimal border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">活跃实例</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground opacity-60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">{status.activeNodeCount}</div>
                </CardContent>
              </Card>

              <Card className="shadow-minimal border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">队列排队数</CardTitle>
                  <Activity className="h-4 w-4 text-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">{status.queueLength}</div>
                </CardContent>
              </Card>

              <Card className="shadow-minimal border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">已处理请求数</CardTitle>
                  <KeySquare className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">{status.totalGenerated}</div>
                </CardContent>
              </Card>

              <Card className="shadow-minimal border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">系统健康度</CardTitle>
                  <Shield className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">{successRate}%</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resource Monitor */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-sm font-semibold text-muted-foreground">打码服务资源占用趋势</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-minimal border-border/50 bg-background/50 backdrop-blur-sm p-0">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                       CPU 使用率
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">{resourceHistory.length > 0 ? resourceHistory[resourceHistory.length-1].cpu : 0}%</Badge>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="w-full mt-2">
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={resourceHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} minTickGap={20} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} />
                          <RechartsTooltip 
                             contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                             itemStyle={{ color: '#3b82f6' }}
                          />
                          <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
              </Card>

              <Card className="shadow-minimal border-border/50 bg-background/50 backdrop-blur-sm p-0">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                       内存使用量
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">{resourceHistory.length > 0 ? resourceHistory[resourceHistory.length-1].memory : 0} MB</Badge>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="w-full mt-2">
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={resourceHistory} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} minTickGap={20} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} />
                          <RechartsTooltip 
                             contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                             itemStyle={{ color: '#8b5cf6' }}
                          />
                          <Area type="monotone" dataKey="memory" name="Memory (MB)" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
