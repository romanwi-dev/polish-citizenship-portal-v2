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
  FolderSync,
  GitCompare,
  Target,
  FlaskConical,
  Sparkles,
  Archive,
  FileSearch,
  Languages,
  FileCheck,
  BookOpen,
  Award,
  ChevronDown,
  Plus
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { Badge } from "@/components/ui/badge";
import { Collapsible } from "@/components/ui/collapsible";

const navSections = [
  {
    title: "Core Management",
    defaultOpen: false,
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
      { title: "Cases", url: "/admin/cases", icon: Users },
      { title: "New Case", url: "/admin/new-case", icon: Plus },
      { title: "Forms Demo", url: "/admin/forms-demo", icon: Sparkles },
      { title: "Big Plan Tracker", url: "/admin/big-plan-tracker", icon: Target },
      { title: "Testing Dashboard", url: "/admin/testing-dashboard", icon: FlaskConical },
    ]
  },
  {
    title: "WORKFLOWS",
    defaultOpen: true,
    highlighted: true,
    items: [
      { title: "Translations", url: "/admin/translations", icon: Languages, badge: "PART 8" },
      { title: "Archives Search", url: "/admin/archives-search", icon: Archive, badge: "PART 7" },
      { title: "Documents Collection", url: "/admin/documents-collection", icon: FileSearch, badge: "PART 6" },
      { title: "Polish Civil Acts", url: "/admin/civil-acts", icon: FileCheck, badge: "PART 10" },
      { title: "Polish Citizenship", url: "/admin/citizenship", icon: BookOpen, badge: "PART 13" },
      { title: "Polish Passport", url: "/admin/passport", icon: Award, badge: "PART 14" },
    ]
  },
  {
    title: "Operations",
    defaultOpen: false,
    items: [
      { title: "Tasks", url: "/admin/tasks", icon: CheckSquare },
      { title: "Documents", url: "/admin/documents", icon: FileText },
      { title: "Messages", url: "/admin/messages", icon: Mail },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "System",
    defaultOpen: false,
    items: [
      { title: "Dropbox Sync", url: "/admin/dropbox", icon: FolderSync },
      { title: "Migration Scanner", url: "/admin/dropbox-migration", icon: GitCompare },
      { title: "System Health", url: "/admin/system-health", icon: Shield },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ]
  }
];

function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(['WORKFLOWS']);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(g => g !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar collapsible="icon" className="bg-background border-r">
      <div className="flex items-center justify-between p-4 border-b">
        {open && (
          <img 
            src={logo} 
            alt="PL Citizenship" 
            className="h-6 w-auto object-contain"
          />
        )}
        <SidebarTrigger />
      </div>
      
      <SidebarContent>
        {navSections.map((section) => {
          const isGroupOpen = openGroups.includes(section.title);
          
          return (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel 
                className={cn(
                  "cursor-pointer flex items-center justify-between hover:bg-accent/50 rounded-md px-2 py-1",
                  section.highlighted && "text-primary font-bold"
                )}
                onClick={() => toggleGroup(section.title)}
              >
                <span>{section.title}</span>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isGroupOpen && "rotate-180"
                  )}
                />
              </SidebarGroupLabel>
              
              <Collapsible open={isGroupOpen}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const active = isActive(item.url, item.exact);
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              active && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                          >
                            <NavLink to={item.url} className="flex items-center gap-2 w-full">
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              {open && (
                                <div className="flex items-center justify-between flex-1">
                                  <span>{item.title}</span>
                                  {item.badge && (
                                    <Badge variant="outline" className="text-[10px] px-1 ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}
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
      <div className="min-h-screen flex w-full relative">
        {/* Full-width unified background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse delay-700" />
        </div>
        
        <AppSidebar />
        <main className="flex-1 overflow-auto relative z-10">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
