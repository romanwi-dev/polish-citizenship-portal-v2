import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentCard } from './DocumentCard';
import { FileText, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentsListViewProps {
  documents: any[];
}

export function DocumentsListView({ documents }: DocumentsListViewProps) {
  const [filter, setFilter] = useState<'all' | 'needs_translation' | 'translated'>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');

  const filteredDocs = documents.filter(doc => {
    if (filter === 'needs_translation' && (!doc.translation_required || doc.is_translated)) {
      return false;
    }
    if (filter === 'translated' && !doc.is_translated) {
      return false;
    }
    if (personFilter !== 'all' && doc.person_type !== personFilter) {
      return false;
    }
    return true;
  });

  const needsTranslation = documents.filter(d => d.translation_required && !d.is_translated).length;
  const translated = documents.filter(d => d.is_translated).length;
  const personTypes = Array.from(new Set(documents.map(d => d.person_type).filter(Boolean)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Documents
            <Badge variant="outline">{filteredDocs.length}</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="needs_translation">
                  Needs Translation ({needsTranslation})
                </SelectItem>
                <SelectItem value="translated">
                  Translated ({translated})
                </SelectItem>
              </SelectContent>
            </Select>

            {personTypes.length > 0 && (
              <Select value={personFilter} onValueChange={setPersonFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All People" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All People</SelectItem>
                  {personTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents match the selected filters</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
