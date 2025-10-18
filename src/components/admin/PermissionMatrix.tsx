import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface Permission {
  feature: string;
  admin: boolean;
  assistant: boolean;
  user: boolean;
}

const permissions: Permission[] = [
  { feature: "View all cases", admin: true, assistant: true, user: false },
  { feature: "Create new cases", admin: true, assistant: true, user: false },
  { feature: "Edit cases", admin: true, assistant: true, user: false },
  { feature: "Delete cases", admin: true, assistant: false, user: false },
  { feature: "View own case", admin: true, assistant: true, user: true },
  { feature: "Upload documents", admin: true, assistant: true, user: true },
  { feature: "Manage documents", admin: true, assistant: true, user: false },
  { feature: "Delete documents", admin: true, assistant: false, user: false },
  { feature: "Generate POA", admin: true, assistant: true, user: false },
  { feature: "Approve POA", admin: true, assistant: false, user: false },
  { feature: "Review OBY", admin: true, assistant: false, user: false },
  { feature: "File OBY", admin: true, assistant: false, user: false },
  { feature: "Upload WSC letters", admin: true, assistant: true, user: false },
  { feature: "Review WSC letters", admin: true, assistant: false, user: false },
  { feature: "Archive requests", admin: true, assistant: true, user: false },
  { feature: "Translation management", admin: true, assistant: true, user: false },
  { feature: "Civil acts requests", admin: true, assistant: true, user: false },
  { feature: "USC workflows", admin: true, assistant: true, user: false },
  { feature: "Messaging", admin: true, assistant: true, user: true },
  { feature: "System settings", admin: true, assistant: false, user: false },
  { feature: "User management", admin: true, assistant: false, user: false },
  { feature: "Role management", admin: true, assistant: false, user: false },
  { feature: "Dropbox sync", admin: true, assistant: false, user: false },
  { feature: "Security audit", admin: true, assistant: false, user: false },
  { feature: "System health", admin: true, assistant: false, user: false },
  { feature: "Backup logs", admin: true, assistant: false, user: false },
];

const PermissionIcon = ({ allowed }: { allowed: boolean }) => (
  allowed ? (
    <Check className="h-4 w-4 text-green-500" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/30" />
  )
);

export const PermissionMatrix = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <CardDescription>
          Overview of what each role can do in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Feature</TableHead>
                <TableHead className="text-center">
                  <Badge variant="destructive">Admin</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge variant="default">Assistant</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge variant="secondary">Client</Badge>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((perm, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{perm.feature}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <PermissionIcon allowed={perm.admin} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <PermissionIcon allowed={perm.assistant} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <PermissionIcon allowed={perm.user} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Role Definitions:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>Admin:</strong> Full system access with all permissions</li>
            <li><strong>Assistant:</strong> Can manage cases and documents but cannot modify system settings or user roles</li>
            <li><strong>Client:</strong> Limited to viewing their own case, uploading documents, and messaging</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
