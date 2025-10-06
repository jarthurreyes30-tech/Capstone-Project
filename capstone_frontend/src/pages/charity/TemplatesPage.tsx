import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/services/apiCharity";
import type { EmailTemplate } from "@/types/charity";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Email Templates Page
 * Create, edit, and manage email templates with variable support
 */
const TemplatesPage = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await listTemplates();
      setTemplates(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setFormData({ name: "", subject: "", body: "" });
    setEditDialogOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, formData);
        toast({ title: "Success", description: "Template updated" });
      } else {
        await createTemplate(formData);
        toast({ title: "Success", description: "Template created" });
      }
      setEditDialogOpen(false);
      loadTemplates();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Save failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteTemplate(selectedTemplate.id);
      toast({ title: "Success", description: "Template deleted" });
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Delete failed",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const renderPreview = (text: string) => {
    // Replace variables with sample data for preview
    return text
      .replace(/{{org_name}}/g, "Example Charity Org")
      .replace(/{{contact_name}}/g, "John Doe")
      .replace(/{{campaign_name}}/g, "Medical Emergency Fund")
      .replace(/{{amount}}/g, "$500")
      .replace(/{{date}}/g, new Date().toLocaleDateString());
  };

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
            <CardTitle>Email Templates</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-xs" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-2xl">
              <p className="text-muted-foreground mb-md">No templates yet</p>
              <Button onClick={handleNew}>Create your first template</Button>
            </div>
          ) : (
            <div className="grid gap-md md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-sm">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Subject:</p>
                      <p className="text-sm font-medium truncate">{template.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Variables:</p>
                      <div className="flex flex-wrap gap-xs mt-xs">
                        {template.variables.map((variable) => (
                          <span
                            key={variable}
                            className="text-xs bg-muted px-xs py-xs rounded"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-xs pt-sm border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-4 w-4 mr-xs" />
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "New Template"}
            </DialogTitle>
            <DialogDescription>
              Use variables like {"{{org_name}}"}, {"{{contact_name}}"}, {"{{campaign_name}}"}, {"{{amount}}"}, {"{{date}}"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-md py-md">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Email"
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="template-subject">Email Subject *</Label>
              <Input
                id="template-subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="e.g., Welcome to {{org_name}}"
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="template-body">Email Body *</Label>
              <Textarea
                id="template-body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Dear {{contact_name}},&#10;&#10;Thank you for your donation..."
                rows={10}
                className="mt-sm font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preview: {selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                Variables are replaced with sample data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-md py-md">
              <div>
                <Label>Subject:</Label>
                <p className="text-sm font-medium mt-xs p-sm bg-muted rounded">
                  {renderPreview(selectedTemplate.subject)}
                </p>
              </div>
              <div>
                <Label>Body:</Label>
                <div className="text-sm mt-xs p-md bg-muted rounded whitespace-pre-wrap">
                  {renderPreview(selectedTemplate.body)}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplatesPage;
