import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/secureLogger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, UserCog, Trash2, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  email: string;
  role: UserRole | null;
  created_at: string;
}

export const RoleManagement = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Fetch all users with their roles
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // Get all users from auth
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Get all role assignments
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = authUsers.map(user => ({
        id: user.id,
        email: user.email || 'No email',
        created_at: user.created_at,
        role: roles?.find(r => r.user_id === user.id)?.role || null
      }));

      return usersWithRoles.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      toast.success("Role assigned successfully");
      setSelectedUser("");
      setSelectedRole("client");
    },
    onError: (error) => {
      logger.error("Role assignment failed", error, { sanitize: true });
      toast.error("Failed to assign role. Please try again.");
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      toast.success("Role removed successfully");
      setDeleteUserId(null);
    },
    onError: (error) => {
      logger.error("Role removal failed", error, { sanitize: true });
      toast.error("Failed to remove role. Please try again.");
      setDeleteUserId(null);
    }
  });

  const handleAssignRole = () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
    assignRoleMutation.mutate({ userId: selectedUser, role: selectedRole });
  };

  const getRoleBadgeVariant = (role: UserRole | null) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'assistant':
        return 'default';
      case 'client':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: UserRole | null) => {
    if (role === 'admin') return <Shield className="h-4 w-4" />;
    if (role === 'assistant') return <UserCog className="h-4 w-4" />;
    return null;
  };

  if (isLoading) return <LoadingState message="Loading users..." />;
  if (error) return <ErrorState message="Failed to load users" />;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Role Management
          </CardTitle>
          <CardDescription>
            Assign roles to control access and permissions throughout the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assign Role</h3>
            <div className="flex gap-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as UserRole)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleAssignRole}
                disabled={assignRoleMutation.isPending}
              >
                {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
              </Button>
            </div>

            {/* Role Descriptions */}
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Shield className="h-4 w-4 text-destructive" />
                  Admin
                </div>
                <p className="text-muted-foreground text-xs">
                  Full system access. Can manage users, cases, settings, and all features.
                </p>
              </div>
              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <UserCog className="h-4 w-4" />
                  Assistant
                </div>
                <p className="text-muted-foreground text-xs">
                  Can manage cases and documents. Limited access to system settings.
                </p>
              </div>
              <div className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  Client
                </div>
                <p className="text-muted-foreground text-xs">
                  Client portal access only. Can view their own case and upload documents.
                </p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Users ({users?.length || 0})</h3>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users?.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getRoleBadgeVariant(user.role)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getRoleIcon(user.role)}
                            {user.role || 'No role'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteUserId(user.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Security Warning */}
          <div className="flex items-start gap-3 border border-amber-500/50 bg-amber-500/10 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Security Best Practices</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Only assign admin role to trusted users</li>
                <li>Regularly audit user roles and permissions</li>
                <li>Remove roles for inactive users</li>
                <li>Role changes take effect immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the role assignment for this user. They will lose their current permissions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && removeRoleMutation.mutate(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeRoleMutation.isPending ? "Removing..." : "Remove Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
