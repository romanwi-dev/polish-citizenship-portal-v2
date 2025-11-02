import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FolderOpen, FileText, Grid3x3, List } from "lucide-react";
import { useDocumentSearch } from "@/hooks/useDocumentSearch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentBrowserAdminProps {
  caseId: string;
}

export const DocumentBrowserAdmin = ({ caseId }: DocumentBrowserAdminProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const {
    documents,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    resultsCount,
    totalCount,
    isLoading
  } = useDocumentSearch(caseId);

  // Organize documents into folder structure
  const folderStructure = useMemo(() => {
    const folders: Record<string, any> = {
      'intake': [],
      'family_docs': {},
      'archive_documents': [],
      'government_correspondence': []
    };

    documents.forEach(doc => {
      const path = doc.dropbox_path || '';
      
      if (path.includes('00_intake')) {
        folders.intake.push(doc);
      } else if (path.includes('01_family_docs')) {
        const personType = doc.person_type || 'uncategorized';
        if (!folders.family_docs[personType]) {
          folders.family_docs[personType] = { originals: [], translations: [] };
        }
        if (path.includes('translations')) {
          folders.family_docs[personType].translations.push(doc);
        } else {
          folders.family_docs[personType].originals.push(doc);
        }
      } else if (path.includes('02_archive')) {
        folders.archive_documents.push(doc);
      } else if (path.includes('06_government')) {
        folders.government_correspondence.push(doc);
      }
    });

    return folders;
  }, [documents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or document content..."
            className="pl-10"
          />
        </div>

        <Select value={filters.personType || 'all'} onValueChange={(v) => setFilters({ ...filters, personType: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Person type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All People</SelectItem>
            <SelectItem value="AP">Applicant</SelectItem>
            <SelectItem value="F">Father</SelectItem>
            <SelectItem value="M">Mother</SelectItem>
            <SelectItem value="PGF">PGF</SelectItem>
            <SelectItem value="PGM">PGM</SelectItem>
            <SelectItem value="MGF">MGF</SelectItem>
            <SelectItem value="MGM">MGM</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {resultsCount} of {totalCount} documents
        </p>
      </div>

      {/* Document grid/list */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card p-4 rounded-lg hover-glow transition-all">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.person_type && (
                      <Badge variant="outline" className="text-xs">{doc.person_type}</Badge>
                    )}
                    {doc.type && (
                      <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                    )}
                    {doc.ocr_confidence && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          doc.ocr_confidence > 80 ? 'border-green-500/50 text-green-700' :
                          doc.ocr_confidence > 60 ? 'border-yellow-500/50 text-yellow-700' :
                          'border-red-500/50 text-red-700'
                        }`}
                      >
                        {doc.ocr_confidence}% OCR
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card p-4 rounded-lg hover-glow transition-all flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {doc.person_type && (
                  <Badge variant="outline" className="text-xs">{doc.person_type}</Badge>
                )}
                {doc.ocr_confidence && (
                  <Badge variant="outline" className="text-xs">{doc.ocr_confidence}%</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No documents found</p>
        </div>
      )}
    </div>
  );
};
