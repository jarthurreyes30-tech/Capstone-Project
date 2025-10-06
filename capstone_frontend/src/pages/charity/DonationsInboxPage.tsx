import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  listDonations,
  confirmDonation,
  rejectDonation,
  bulkConfirmDonations,
  bulkRejectDonations,
} from "@/services/apiCharity";
import type { Donation } from "@/types/charity";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DonationDetail from "@/components/charity/DonationDetail";

/**
 * Donations Inbox Page
 * Table of donations with inline actions and bulk operations
 */
const DonationsInboxPage = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  useEffect(() => {
    loadDonations();
  }, [page]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await listDonations({
        page,
        pageSize: 20,
        status: "pending",
        sortBy: "submittedAt",
        sortOrder: "desc",
      });
      setDonations(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load donations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await confirmDonation(id, {});
      toast({ title: "Success", description: "Donation confirmed" });
      loadDonations();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to confirm",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedDonation || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason",
        variant: "destructive",
      });
      return;
    }
    try {
      await rejectDonation(selectedDonation.id, { reason: rejectReason });
      toast({ title: "Success", description: "Donation rejected" });
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedDonation(null);
      loadDonations();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reject",
        variant: "destructive",
      });
    }
  };

  const handleBulkConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkConfirmDonations(selectedIds);
      toast({
        title: "Success",
        description: `${selectedIds.length} donations confirmed`,
      });
      setSelectedIds([]);
      loadDonations();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Bulk confirm failed",
        variant: "destructive",
      });
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0 || !bulkRejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason",
        variant: "destructive",
      });
      return;
    }
    try {
      await bulkRejectDonations(selectedIds, bulkRejectReason);
      toast({
        title: "Success",
        description: `${selectedIds.length} donations rejected`,
      });
      setBulkRejectDialogOpen(false);
      setBulkRejectReason("");
      setSelectedIds([]);
      loadDonations();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Bulk reject failed",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(donations.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  if (loading && donations.length === 0) {
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
          <CardTitle>Donations Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-md p-md bg-muted rounded-md">
              <span className="text-sm font-medium">
                {selectedIds.length} selected
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkConfirm}>
                <CheckCircle className="h-4 w-4 mr-xs" />
                Confirm All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkRejectDialogOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-xs" />
                Reject All
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIds.length === donations.length &&
                        donations.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Checksum</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-lg">
                      <p className="text-muted-foreground">No pending donations</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(donation.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(donation.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{donation.donorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {donation.donorEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${donation.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{donation.method}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(donation.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {donation.proofChecksum ? (
                          <div className="flex items-center gap-xs">
                            <span className="text-xs font-mono">
                              {donation.proofChecksum.slice(0, 8)}...
                            </span>
                            {donation.checksumVerified && (
                              <CheckCircle className="h-3 w-3 text-success" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-xs">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDonation(donation);
                              setDetailDrawerOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirm(donation.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDonation(donation);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* Detail Drawer */}
      {selectedDonation && (
        <DonationDetail
          donationId={selectedDonation.id}
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
          onUpdate={loadDonations}
        />
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Donation</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this donation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-md py-md">
            <div>
              <Label htmlFor="reject-reason">Reason</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="mt-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Dialog */}
      <Dialog open={bulkRejectDialogOpen} onOpenChange={setBulkRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {selectedIds.length} Donations</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting these donations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-md py-md">
            <div>
              <Label htmlFor="bulk-reject-reason">Reason</Label>
              <Textarea
                id="bulk-reject-reason"
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="mt-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkReject}>Reject All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonationsInboxPage;
