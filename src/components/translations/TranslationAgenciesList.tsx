import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Phone, Star } from "lucide-react";

export const TranslationAgenciesList = () => {
  const { data: agencies, isLoading } = useQuery<any[]>({
    queryKey: ["translation-agencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_agencies' as any)
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <div>Loading agencies...</div>;
  }

  return (
    <div className="grid gap-4">
      {agencies?.map((agency) => (
        <Card key={agency.id} className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{agency.name}</h3>
                {agency.contact_person && (
                  <p className="text-sm text-muted-foreground">
                    Contact: {agency.contact_person}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {agency.email}
              </div>
              {agency.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {agency.phone}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {agency.languages?.map((lang: string) => (
                <Badge key={lang} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{agency.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {agency.total_jobs} jobs completed
              </span>
            </div>
          </div>
        </Card>
      ))}

      {agencies?.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No translation agencies registered</p>
        </Card>
      )}
    </div>
  );
};