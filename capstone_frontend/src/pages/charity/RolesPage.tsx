import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { listRoles, updateRole } from "@/services/apiCharity";
import type { Role } from "@/types/charity";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Roles & Permissions Page (UI Only)
 * Manage role permissions with a simple matrix grid
 */
const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedRole, setEditedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await listRoles();
      setRoles(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    roleId: string,
    resource: string,
    action: "view" | "create" | "edit" | "delete",
    value: boolean
  ) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id === roleId) {
          const updated = {
            ...role,
            permissions: {
              ...role.permissions,
              [resource]: {
                ...role.permissions[resource],
                [action]: value,
              },
            },
          };
          setEditedRole(updated);
          return updated;
        }
        return role;
      })
    );
  };

  const handleSave = async () => {
    if (!editedRole) return;
    try {
      await updateRole(editedRole.id, {
        permissions: editedRole.permissions,
      });
      toast({ title: "Success", description: "Permissions updated" });
      setEditedRole(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Update failed",
        variant: "destructive",
      });
    }
  };

  const resources = [
    "campaigns",
    "donations",
    "documents",
    "fund_usage",
    "reports",
    "templates",
    "roles",
  ];

  if (loading) {
    return (
      <div className="p-lg">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Roles & Permissions</CardTitle>
            {editedRole && (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-xs" />
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2xl">
            {roles.map((role) => (
              <div key={role.id} className="space-y-md">
                <div>
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>

                {/* Permission Matrix */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted px-md py-sm">
                    <div className="grid grid-cols-5 gap-md text-xs font-medium">
                      <div>Resource</div>
                      <div className="text-center">View</div>
                      <div className="text-center">Create</div>
                      <div className="text-center">Edit</div>
                      <div className="text-center">Delete</div>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {resources.map((resource) => {
                      const permissions = role.permissions[resource] || {
                        view: false,
                        create: false,
                        edit: false,
                        delete: false,
                      };
                      return (
                        <div
                          key={resource}
                          className="grid grid-cols-5 gap-md px-md py-sm items-center hover:bg-muted/30"
                        >
                          <Label className="capitalize cursor-pointer">
                            {resource.replace(/_/g, " ")}
                          </Label>
                          <div className="flex justify-center">
                            <Switch
                              checked={permissions.view}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  role.id,
                                  resource,
                                  "view",
                                  checked
                                )
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Switch
                              checked={permissions.create}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  role.id,
                                  resource,
                                  "create",
                                  checked
                                )
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Switch
                              checked={permissions.edit}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  role.id,
                                  resource,
                                  "edit",
                                  checked
                                )
                              }
                            />
                          </div>
                          <div className="flex justify-center">
                            <Switch
                              checked={permissions.delete}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  role.id,
                                  resource,
                                  "delete",
                                  checked
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolesPage;
