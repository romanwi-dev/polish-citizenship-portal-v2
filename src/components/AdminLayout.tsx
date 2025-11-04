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
    <Sidebar collapsible="icon" className="border-r border-primary/20">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {open && (
          <img 
            src={logo} 
            alt="PL Citizenship" 
            className="h-6 w-auto object-contain"
          />
        )}
        <button
          onClick={() => setOpen(!open)}
          className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>
      
      <SidebarContent>
        {navSections.map((section) => {
          const isGroupOpen = openGroups.includes(section.title);
          
          return (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel 
                className={cn(
                  "cursor-pointer flex items-center justify-between hover:bg-accent/50 rounded-md px-2 py-1 transition-all",
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
                              "transition-all hover:bg-background/20 border border-transparent hover:border-primary/30",
                              active && "bg-primary/20 text-primary border-primary/50 hover:bg-primary/30"
                            )}
                          >
                            <NavLink to={item.url} className="flex items-center gap-2 w-full">
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              {open && (
                                <div className="flex items-center justify-between flex-1">
                                  <span>{item.title}</span>
                                  {item.badge && (
                                    <Badge variant="outline" className="text-xs px-1.5 ml-auto border-primary/30">
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
