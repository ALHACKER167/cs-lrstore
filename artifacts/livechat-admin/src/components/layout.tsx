import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { MessageSquare, Settings, LayoutDashboard, Globe, ExternalLink, Zap } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Conversations", href: "/conversations", icon: MessageSquare },
    { name: "Widget Sites", href: "/widget-sites", icon: Globe },
    { name: "Widget Preview", href: "/widget-preview", icon: ExternalLink },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-sidebar-border" variant="sidebar">
          <SidebarHeader className="p-4 border-b border-sidebar-border/50">
            <div className="flex items-center gap-2 px-2 font-semibold text-xl text-sidebar-foreground">
              <Zap className="w-6 h-6 text-sidebar-primary" fill="currentColor" />
              <span>LRSTORE</span>
            </div>
            <div className="px-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mt-1">LiveChat Admin</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
                        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                      >
                        <Link href={item.href} className="flex items-center gap-3 w-full">
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
