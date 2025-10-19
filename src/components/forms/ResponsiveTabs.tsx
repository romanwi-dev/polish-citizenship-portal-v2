import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface Tab {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface ResponsiveTabsProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const ResponsiveTabs = ({
  tabs,
  value,
  onValueChange,
  className,
}: ResponsiveTabsProps) => {
  const isMobile = useIsMobile();

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      {isMobile && tabs.length > 5 ? (
        // Mobile: Dropdown for 6+ tabs
        <div className="mb-4">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full" aria-label="Select form section">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {tabs.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        // Desktop or <6 tabs: Standard tabs
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/30 p-1 mb-4">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 min-w-[120px] data-[state=active]:bg-background"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      )}

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
