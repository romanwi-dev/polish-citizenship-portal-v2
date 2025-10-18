import { AdminLayout } from "@/components/AdminLayout";
import { RoleManagement as RoleManagementComponent } from "@/components/admin/RoleManagement";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

export default function RoleManagement() {
  const { user, loading: authLoading } = useAuth(true);
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);

  if (authLoading || roleLoading) {
    return <LoadingState message="Checking permissions..." />;
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <ErrorState message="Access denied. Admin role required." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user roles and permissions across the system
          </p>
        </div>
        
        <RoleManagementComponent />
        
        <div className="mt-6">
          <PermissionMatrix />
        </div>
      </div>
    </AdminLayout>
  );
}
