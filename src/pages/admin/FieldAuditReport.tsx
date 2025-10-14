// Field Mapping Audit Report - Shows all 242+ fields and their mappings

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALL_FIELD_MAPPINGS, getFieldsForForm, getFieldsForTable } from "@/config/fieldMappings";
import { fieldValidator } from "@/utils/fieldMappingValidator";

export default function FieldAuditReport() {
  const auditReport = fieldValidator.generateAuditReport();
  const duplicates = fieldValidator.findDuplicates();
  
  const intakeFields = getFieldsForForm('intake');
  const masterFields = getFieldsForForm('master');
  const intakeDataFields = getFieldsForTable('intake_data');
  const masterTableFields = getFieldsForTable('master_table');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Field Mapping Audit Report</h1>
        <p className="text-muted-foreground">Complete overview of all 242+ fields across forms and database</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ALL_FIELD_MAPPINGS.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Intake Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intakeFields.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Master Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masterFields.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Duplicates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duplicates.formFields.length + duplicates.dbColumns.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      {(duplicates.formFields.length > 0 || duplicates.dbColumns.length > 0) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Mapping Issues Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {duplicates.formFields.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Duplicate Form Fields:</h3>
                <div className="flex flex-wrap gap-2">
                  {duplicates.formFields.map(field => (
                    <Badge key={field} variant="destructive">{field}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {duplicates.dbColumns.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Duplicate DB Columns:</h3>
                <div className="flex flex-wrap gap-2">
                  {duplicates.dbColumns.map(col => (
                    <Badge key={col} variant="destructive">{col}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Mappings */}
      <Card>
        <CardHeader>
          <CardTitle>Field Mappings by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="intake">
            <TabsList className="flex gap-0.5 bg-transparent p-0 overflow-x-auto scrollbar-hide w-full">
              <TabsTrigger value="intake" className="flex-shrink-0">
                <span>Intake ({intakeFields.length})</span>
              </TabsTrigger>
              <TabsTrigger value="master" className="flex-shrink-0">
                <span>Master ({masterFields.length})</span>
              </TabsTrigger>
              <TabsTrigger value="intake_db" className="flex-shrink-0">
                <span>intake_data ({intakeDataFields.length})</span>
              </TabsTrigger>
              <TabsTrigger value="master_db" className="flex-shrink-0">
                <span>master_table ({masterTableFields.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="intake" className="space-y-2 mt-4">
              {intakeFields.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">{field.formField}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{field.dbTable}.{field.dbColumn}</Badge>
                    <Badge>{field.fieldType}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="master" className="space-y-2 mt-4">
              {masterFields.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">{field.formField}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{field.dbTable}.{field.dbColumn}</Badge>
                    <Badge>{field.fieldType}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="intake_db" className="space-y-2 mt-4">
              {intakeDataFields.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">{field.dbColumn}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{field.formField}</Badge>
                    <Badge>{field.fieldType}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="master_db" className="space-y-2 mt-4">
              {masterTableFields.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">{field.dbColumn}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{field.formField}</Badge>
                    <Badge>{field.fieldType}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Raw Audit Report */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">{auditReport}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
