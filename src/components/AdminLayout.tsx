import { ReactNode } from "react";
import * as React from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Plus,
  Brain,
  FileCode,
  PanelLeft
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.webp";
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
      { title: "AI Workflow", url: "/admin/ai-workflow", icon: Brain, badge: "AI" },
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
      { title: "OCR Review", url: "/admin/ocr-review", icon: FileSearch, badge: "NEW" },
      { title: "Messages", url: "/admin/messages", icon: Mail },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "System",
    defaultOpen: false,
    items: [
      { title: "System Overview", url: "/admin/system-overview", icon: BookOpen },
      { title: "Code Review", url: "/admin/code-review", icon: FileCode, badge: "GPT-5" },
      { title: "Dropbox Sync", url: "/admin/dropbox", icon: FolderSync },
      { title: "Migration Scanner", url: "/admin/dropbox-migration", icon: GitCompare },
      { title: "System Health", url: "/admin/system-health", icon: Shield },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ]
  }
];

function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(['Core Management', 'WORKFLOWS', 'Operations', 'System']);

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
    <Sidebar collapsible="icon" className="bg-background/95 backdrop-blur-xl border-r border-primary/20">
      {/* Background effects matching homepage dropdown */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header with close button only */}
        <div className={cn(
          "flex items-center justify-between border-b border-border/50 flex-shrink-0",
          open ? "p-4" : "p-2"
        )}>
          {open && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Navigation</span>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "flex items-center justify-center hover:bg-accent/20 rounded-md transition-all",
              open ? "h-6 w-6 opacity-20 hover:opacity-60" : "h-5 w-5 opacity-15 hover:opacity-50 mx-auto"
            )}
          >
            <PanelLeft className={cn(open ? "h-3 w-3" : "h-3 w-3")} />
          </button>
        </div>
        
        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className={cn("space-y-4", open ? "p-4" : "p-2")}>
            {navSections.map((section) => {
              const isGroupOpen = openGroups.includes(section.title);
              
              return (
                <div key={section.title} className="space-y-2">
                  {open && (
                    <button 
                      className="flex items-center gap-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full"
                      onClick={() => toggleGroup(section.title)}
                    >
                      {section.title}
                      <ChevronDown 
                        className={cn(
                          "h-3 w-3 transition-transform ml-auto",
                          isGroupOpen && "rotate-180"
                        )}
                      />
                    </button>
                  )}
                  
                  {(open ? isGroupOpen : true) && (
                    <div className={cn("space-y-1", open ? "px-2" : "px-0")}>
                      {section.items.map((item) => {
                        const active = isActive(item.url, item.exact);
                        return (
                          <NavLink
                            key={item.title}
                            to={item.url}
                            title={!open ? item.title : undefined}
                            className={cn(
                              "flex items-center transition-colors group",
                              open 
                                ? "gap-3 px-3 py-2 rounded-lg" 
                                : "gap-0 px-2 py-2 justify-center rounded-md",
                              active 
                                ? "bg-accent text-primary font-medium" 
                                : "hover:bg-accent/50"
                            )}
                          >
                            <item.icon className={cn(
                              "flex-shrink-0",
                              open ? "h-4 w-4" : "h-5 w-5"
                            )} />
                            {open && (
                              <span className="text-sm font-medium capitalize group-hover:text-primary transition-colors">
                                {item.title}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Sidebar>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Clear any old sidebar cookie and force it open
  React.useEffect(() => {
    document.cookie = "sidebar:state=true; path=/; max-age=604800";
  }, []);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        {/* Fixed toggle button - always visible even when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
        )}
        
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
