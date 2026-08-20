import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import {
  usePermissions,
  useRoles,
  useCreatePermission,
  useDeletePermission,
  useToggleRolePermission,
} from "@/features/permissions/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageState } from "@/components/ui/page-state";

export default function PermissionsPage() {
  const { data: permissions = [], isLoading, isError, error } = usePermissions();
  const { data: roles = [] } = useRoles();
  const create = useCreatePermission();
  const remove = useDeletePermission();
  const toggle = useToggleRolePermission();
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const roleNames = (permission: { assignedRoles?: string | null }) =>
    (permission.assignedRoles ?? "").split(/,\s*/).filter(Boolean);

  const handleCreate = () => {
    if (!newName.trim()) return;
    create.mutate(
      { name: newName.trim(), description: newDescription.trim() || null },
      { onSuccess: () => { setNewName(""); setNewDescription(""); } },
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Administration"
          title="Permissions"
          description="Define permissions and assign them to roles."
        />

        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-4 shadow-sm">
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Permission name (e.g. manage_books)"
            className="h-9 flex-1 min-w-52 text-xs"
            aria-label="Permission name"
          />
          <Input
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            placeholder="Description (optional)"
            className="h-9 flex-1 min-w-52 text-xs"
            aria-label="Permission description"
          />
          <Button
            type="button"
            size="sm"
            className="h-9"
            disabled={!newName.trim() || create.isPending}
            onClick={handleCreate}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add permission
          </Button>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading permissions...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">Failed to load permissions: {(error as Error).message}</p>
        ) : permissions.length === 0 ? (
          <PageState
            icon={<ShieldCheck className="h-7 w-7 text-camel" />}
            title="No permissions defined."
            description="Create a permission above to get started."
          />
        ) : (
          <div className="mt-6 space-y-3">
            {permissions.map((permission) => {
              const assigned = roleNames(permission);
              return (
                <div key={permission.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-camel-dark">
                        {permission.name}
                      </p>
                      {permission.description && (
                        <p className="mt-0.5 text-xs text-muted">{permission.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {roles.map((role) => {
                          const active = assigned.includes(role.name);
                          return (
                            <button
                              key={role.id}
                              type="button"
                              aria-pressed={active}
                              disabled={toggle.isPending}
                              onClick={() =>
                                toggle.mutate({
                                  roleId: role.id,
                                  permissionId: permission.id,
                                  assign: !active,
                                })
                              }
                              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                                active
                                  ? "border-camel bg-camel text-card hover:bg-camel-dark"
                                  : "border-line bg-cream text-muted hover:border-camel hover:text-ink"
                              }`}
                            >
                              {role.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(permission.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}