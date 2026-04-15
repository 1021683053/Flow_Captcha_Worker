"use client";

import { HardDrive, Server, ShieldPlus, Home, Settings2, ShieldQuestion, Key, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "仪表盘",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "代理节点",
    url: "/nodes",
    icon: Server,
  },
  {
    title: "实例集群",
    url: "/workers",
    icon: HardDrive,
  },
  {
    title: "打码日志",
    url: "/logs",
    icon: ShieldQuestion,
  },
  {
    title: "业务 API 密钥",
    url: "/api-keys",
    icon: ShieldPlus, // Reusing ShieldPlus but could use Key icon if available. I'll import Key. Let's do that below. 
  },
  {
    title: "系统设置",
    url: "/settings",
    icon: Settings2,
  },
]

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  return (
    <Sidebar className="border-r-0 bg-sidebar z-sidebar">
      <SidebarHeader className="p-4 border-none bg-transparent">
        <div className="flex items-center gap-2 px-2">
          <div className="bg-foreground p-1.5 rounded-md shadow-minimal">
            <ShieldPlus className="h-4 w-4 text-background" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">CaptchaOps</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-transparent px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium px-2 py-2">系统平台</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={isActive}
                      onClick={() => router.push(item.url)}
                      className={`h-9 rounded-md transition-colors ${
                        isActive 
                          ? "bg-foreground/10 text-foreground shadow-minimal" 
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-none bg-transparent">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            router.push("/login");
          }}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm bg-muted/30 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-minimal border border-border/50 mb-3"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
        <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground font-mono">
          <HardDrive className="h-3 w-3" />
          <span>v5 SQLite Node</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
