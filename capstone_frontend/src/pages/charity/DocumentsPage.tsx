import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listDocuments,
  uploadDocument,
  verifyDocument,
  requestDocumentInfo,
  computeChecksum,
} from "@/services/apiCharity";
import type { Document } from "@/types/charity";
import { Upload, CheckCircle, AlertCircle, Download, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Documents Page
 * Upload, view, and verify charity documents
 */
const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [page, statusFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await listDocuments({
        page,
        pageSize: 20,
        status: statusFilter || undefined,
      });
      setDocuments(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only PDF, PNG, JPG, and JPEG files are allowed",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const checksum = await computeChecksum(file);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("checksum", checksum);
      formData.append("documentType", "verification");

      await uploadDocument(formData);
      toast({ title: "Success", description: "Document uploaded successfully" });
      setUploadDialogOpen(false);
      loadDocuments();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyDocument(id);
      toast({ title: "Success", description: "Document verified" });
      loadDocuments();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to verify",
        variant: "destructive",
      });
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedDocument || !adminNote.trim()) {
      toast({
        title: "Error",
        description: "Please provide a message",
        variant: "destructive",
      });
      return;
    }
    try {
      await requestDocumentInfo(selectedDocument.id, adminNote);
      toast({ title: "Success", description: "Information requested" });
      setNoteDialogOpen(false);
      setAdminNote("");
      setSelectedDocument(null);
      loadDocuments();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Request failed",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Document["status"]) => {
    const variants: Record<Document["status"], string> = {
      pending: "bg-warning/10 text-warning",
      verified: "bg-success/10 text-success",
      rejected: "bg-destructive/10 text-destructive",
      info_requested: "bg-accent/10 text-accent-foreground",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading && documents.length === 0) {
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
            <CardTitle>Documents</CardTitle>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-xs" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Filters */}
          <div className="flex gap-md items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="info_requested">Info Requested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Checksum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-lg">
                      <p className="text-muted-foreground">No documents found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        {doc.thumbnailUrl ? (
                          <img
                            src={doc.thumbnailUrl}
                            alt="Preview"
                            className="h-10 w-10 object-cover rounded border"
                          />
                        ) : doc.mimeType.startsWith("image/") ? (
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        ) : (
                          <FileText className="h-10 w-10 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {doc.filename}
                      </TableCell>
                      <TableCell className="capitalize">{doc.documentType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-xs">
                          <code className="text-xs font-mono">
                            {doc.checksum.slice(0, 8)}...
                          </code>
                          {doc.checksumVerified && (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-xs">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setViewDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {doc.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVerify(doc.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setNoteDialogOpen(true);
                                }}
                              >
                                <AlertCircle className="h-4 w-4 text-warning" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a verification document (PDF, PNG, JPG, max 10MB)
            </DialogDescription>
          </DialogHeader>
          <div className="py-md">
            <Label htmlFor="file-upload" className="block mb-sm">
              Select File
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm file:mr-md file:py-sm file:px-md file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {uploading && (
              <p className="text-sm text-muted-foreground mt-sm">
                Computing checksum and uploading...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedDocument && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedDocument.filename}</DialogTitle>
              <DialogDescription>Document details and preview</DialogDescription>
            </DialogHeader>
            <div className="space-y-md py-md">
              <div className="grid grid-cols-2 gap-md text-sm">
                <div>
                  <p className="text-muted-foreground">Type:</p>
                  <p className="font-medium capitalize">{selectedDocument.documentType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status:</p>
                  {getStatusBadge(selectedDocument.status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded:</p>
                  <p className="font-medium">
                    {new Date(selectedDocument.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size:</p>
                  <p className="font-medium">
                    {(selectedDocument.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-xs">SHA-256 Checksum:</p>
                <code className="text-xs font-mono bg-muted p-sm rounded block break-all">
                  {selectedDocument.checksum}
                </code>
              </div>
              {selectedDocument.adminNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-xs">Admin Notes:</p>
                  <p className="text-sm p-sm bg-muted rounded">{selectedDocument.adminNotes}</p>
                </div>
              )}
              <div className="border rounded-md p-md bg-muted/30">
                {selectedDocument.mimeType.startsWith("image/") ? (
                  <img
                    src={selectedDocument.fileUrl}
                    alt="Document preview"
                    className="w-full rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-2xl">
                    <FileText className="h-16 w-16 text-muted-foreground mb-md" />
                    <p className="text-sm text-muted-foreground">
                      PDF Preview (download to view)
                    </p>
                    <Button variant="outline" size="sm" className="mt-md" asChild>
                      <a href={selectedDocument.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-xs" />
                        Download
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Request Info Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>
              Send a message requesting additional documentation or clarification
            </DialogDescription>
          </DialogHeader>
          <div className="py-md">
            <Label htmlFor="admin-note">Message</Label>
            <Textarea
              id="admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Describe what information is needed..."
              className="mt-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestInfo}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
