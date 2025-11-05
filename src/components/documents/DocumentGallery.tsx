import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  CheckSquare, 
  Square,
  Languages,
  Tag,
  MoreVertical,
  Grid3x3,
  List,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type?: string;
  category?: string;
  file_extension?: string;
  dropbox_path?: string;
  ocr_status?: string;
  ocr_confidence?: number;
  needs_translation?: boolean;
  is_translated?: boolean;
  created_at?: string;
}

interface DocumentGalleryProps {
  documents: Document[];
  onPreview: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete: (docIds: string[]) => void;
  onMarkTranslation: (docIds: string[], needsTranslation: boolean) => void;
  onChangeCategory: (docIds: string[], category: string) => void;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "type" | "status";

export function DocumentGallery({
  documents,
  onPreview,
  onDownload,
  onDelete,
  onMarkTranslation,
  onChangeCategory,
}: DocumentGalleryProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterType, setFilterType] = useState<string>("all");

  // Selection handlers
  const toggleSelection = (docId: string) => {
    const newSelection = new Set(selectedDocs);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocs(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocs.map(d => d.id)));
    }
  };

  const clearSelection = () => setSelectedDocs(new Set());

  // Filter and sort
  const filteredDocs = documents
    .filter(doc => {
      if (filterType === "all") return true;
      if (filterType === "images") return [".jpg", ".jpeg", ".png", ".gif"].includes(doc.file_extension || "");
      if (filterType === "pdfs") return doc.file_extension === ".pdf";
      if (filterType === "needs_translation") return doc.needs_translation;
      if (filterType === "ocr_complete") return doc.ocr_status === "completed";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "date") return (b.created_at || "").localeCompare(a.created_at || "");
      if (sortBy === "type") return (a.file_extension || "").localeCompare(b.file_extension || "");
      if (sortBy === "status") return (a.ocr_status || "").localeCompare(b.ocr_status || "");
      return 0;
    });

  // Bulk actions
  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedDocs.size} documents?`)) {
      onDelete(Array.from(selectedDocs));
      clearSelection();
    }
  };

  const handleBulkMarkTranslation = (needsTranslation: boolean) => {
    onMarkTranslation(Array.from(selectedDocs), needsTranslation);
    clearSelection();
  };

  const handleBulkChangeCategory = (category: string) => {
    onChangeCategory(Array.from(selectedDocs), category);
    clearSelection();
  };

  // Get thumbnail/icon
  const getDocumentPreview = (doc: Document) => {
    const ext = doc.file_extension?.toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext || "")) {
      return (
        <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
          <img 
            src={`https://via.placeholder.com/300x200?text=${doc.name}`}
            alt={doc.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }
    
    return (
      <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
        <FileText className="w-16 h-16 text-muted-foreground" />
      </div>
    );
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.ocr_status === "completed") {
      return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">OCR ✓</Badge>;
    }
    if (doc.ocr_status === "processing") {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">Processing...</Badge>;
    }
    if (doc.ocr_status === "failed") {
      return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">Failed</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="images">Images Only</SelectItem>
              <SelectItem value="pdfs">PDFs Only</SelectItem>
              <SelectItem value="needs_translation">Needs Translation</SelectItem>
              <SelectItem value="ocr_complete">OCR Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredDocs.length} documents
          </span>
          {selectedDocs.size > 0 && (
            <Badge variant="secondary">
              {selectedDocs.size} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedDocs.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
          >
            {selectedDocs.size === filteredDocs.length ? (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4 mr-2" />
                Select All
              </>
            )}
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkMarkTranslation(true)}
          >
            <Languages className="w-4 h-4 mr-2" />
            Mark for Translation
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="w-4 h-4 mr-2" />
                Change Category
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkChangeCategory("birth_certificate")}>
                Birth Certificate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkChangeCategory("marriage_certificate")}>
                Marriage Certificate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkChangeCategory("passport")}>
                Passport
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkChangeCategory("other")}>
                Other
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete ({selectedDocs.size})
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="ml-auto"
          >
            Clear
          </Button>
        </motion.div>
      )}

      {/* Document Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {filteredDocs.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className={cn(
              "overflow-hidden hover:shadow-lg transition-all cursor-pointer",
              selectedDocs.has(doc.id) && "ring-2 ring-primary"
            )}>
              {viewMode === "grid" ? (
                <div className="space-y-3 p-4">
                  {/* Thumbnail */}
                  <div className="relative">
                    {getDocumentPreview(doc)}
                    <Checkbox
                      checked={selectedDocs.has(doc.id)}
                      onCheckedChange={() => toggleSelection(doc.id)}
                      className="absolute top-2 left-2 bg-background"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-2 flex-1">
                        {doc.name}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onPreview(doc)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload(doc)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete([doc.id])}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {doc.category && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                      )}
                      {getStatusBadge(doc)}
                      {doc.needs_translation && (
                        <Badge variant="outline" className="text-xs">
                          <Languages className="w-3 h-3 mr-1" />
                          Translate
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreview(doc)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(doc)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // List view
                <div className="flex items-center gap-4 p-4">
                  <Checkbox
                    checked={selectedDocs.has(doc.id)}
                    onCheckedChange={() => toggleSelection(doc.id)}
                  />
                  <FileText className="w-10 h-10 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.category && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                      )}
                      {getStatusBadge(doc)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPreview(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownload(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete([doc.id])}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No documents found</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
