import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { adminService, Charity } from "@/services/admin";


export default function Charities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCharities();
  }, [currentPage, filterStatus]);

  const fetchCharities = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllCharities(currentPage, {
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      setCharities(response.data);
    } catch (error: any) {
      console.error('Failed to fetch charities:', error);
      toast.error('Failed to load charities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (charity: Charity) => {
    try {
      const details = await adminService.getCharityDetails(charity.id);
      setSelectedCharity(details);
      setIsDetailDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load charity details');
    }
  };

  const handleApprove = async (charityId: number) => {
    try {
      await adminService.approveCharity(charityId);
      toast.success("Charity approved successfully");
      setIsDetailDialogOpen(false);
      fetchCharities(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve charity');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    if (!selectedCharity) return;

    try {
      await adminService.rejectCharity(selectedCharity.id, rejectReason);
      toast.success("Charity rejected");
      setIsRejectDialogOpen(false);
      setIsDetailDialogOpen(false);
      setRejectReason("");
      fetchCharities(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject charity');
    }
  };

  const handleRequestInfo = (charityId: number) => {
    toast.info("Information request sent to charity");
    setIsDetailDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charity.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading charities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Charity Registrations</h1>
        <p className="text-muted-foreground">
          Review and manage charity applications
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search charities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Organization Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCharities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No charities found
                </TableCell>
              </TableRow>
            ) : filteredCharities.map((charity) => (
              <TableRow key={charity.id}>
                <TableCell className="font-medium">{charity.id}</TableCell>
                <TableCell>{charity.name}</TableCell>
                <TableCell>{charity.contact_email}</TableCell>
                <TableCell>{getStatusBadge(charity.verification_status)}</TableCell>
                <TableCell>{new Date(charity.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetail(charity)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Charity Application Details</DialogTitle>
            <DialogDescription>
              Review the charity registration information
            </DialogDescription>
          </DialogHeader>
          {selectedCharity && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-semibold">Organization Name</Label>
                <p>{selectedCharity.name}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Email</Label>
                <p>{selectedCharity.contact_email}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Registration Number</Label>
                <p className="text-sm text-muted-foreground">{selectedCharity.reg_no || 'N/A'}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Mission</Label>
                <p className="text-sm text-muted-foreground">{selectedCharity.mission || 'N/A'}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Status</Label>
                {getStatusBadge(selectedCharity.verification_status)}
              </div>
              {selectedCharity.verification_notes && (
                <div className="grid gap-2">
                  <Label className="font-semibold">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedCharity.verification_notes}</p>
                </div>
              )}
              {selectedCharity.documents && selectedCharity.documents.length > 0 && (
                <div className="grid gap-2">
                  <Label className="font-semibold">Submitted Documents</Label>
                  <div className="space-y-2">
                    {selectedCharity.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2">
                        <span className="text-sm">{doc.document_type}</span>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedCharity?.verification_status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleRequestInfo(selectedCharity.id)}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Info
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsRejectDialogOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleApprove(selectedCharity.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Charity Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
