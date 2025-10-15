import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, Star } from "lucide-react";

export const SwornTranslatorsList = () => {
  const { data: translators, isLoading } = useQuery({
    queryKey: ["sworn-translators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sworn_translators')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading translators...</div>;
  }

  return (
    <div className="grid gap-4">
      {translators?.map((translator) => (
        <Card key={translator.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{translator.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cert: {translator.certification_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {translator.email}
                </div>
                {translator.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {translator.phone}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {translator.languages?.map((lang: string) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{translator.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {translator.total_jobs} jobs completed
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {translators?.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No sworn translators registered</p>
        </Card>
      )}
    </div>
  );
};