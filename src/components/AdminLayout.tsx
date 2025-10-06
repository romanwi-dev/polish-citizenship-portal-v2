import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  Mail, 
  Settings, 
  Shield,
  BarChart3,
  FolderSync
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Cases", url: "/admin/cases", icon: Users },
  { title: "Tasks", url: "/admin/tasks", icon: CheckSquare },
  { title: "Documents", url: "/admin/documents", icon: FileText },
  { title: "Messages", url: "/admin/messages", icon: Mail },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Dropbox Sync", url: "/admin/dropbox", icon: FolderSync },
  { title: "System Health", url: "/admin/health", icon: Shield },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b">
        {open && <h2 className="text-lg font-bold">PL Citizenship</h2>}
        <SidebarTrigger />
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.url, item.exact);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        active && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
