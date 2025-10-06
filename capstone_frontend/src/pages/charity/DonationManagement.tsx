import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Download, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Donation {
  id: number;
  donor: string;
  campaign: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'rejected';
  proofUrl?: string;
  isAnonymous: boolean;
}

export default function DonationManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleConfirm = (id: number) => {
    setDonations(donations.map(d => 
      d.id === id ? { ...d, status: 'confirmed' as const } : d
    ));
    toast.success("Donation confirmed successfully");
  };

  const handleReject = () => {
    if (selectedDonation && rejectReason.trim()) {
      setDonations(donations.map(d => 
        d.id === selectedDonation.id ? { ...d, status: 'rejected' as const } : d
      ));
      toast.success("Donation rejected");
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setSelectedDonation(null);
    } else {
      toast.error("Please provide a reason for rejection");
    }
  };

  const handleView = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsViewDialogOpen(true);
  };

  const openRejectDialog = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-600">Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  useEffect(() => {
    // TODO: Load donations from API when backend is ready
    setLoading(false);
  }, []);

  const stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Donation Management</h1>
          <p className="text-muted-foreground text-sm">
            Review and manage incoming donations
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Donations</CardTitle>
              <CardDescription>Review and confirm donation submissions</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading donations...</div>
          ) : donations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No donations yet. Donations will appear here when donors contribute to your campaigns.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">
                      {donation.isAnonymous ? "Anonymous Donor" : donation.donor}
                    </TableCell>
                    <TableCell>{donation.campaign}</TableCell>
                    <TableCell className="font-bold">₱{donation.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(donation.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(donation)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {donation.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConfirm(donation.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRejectDialog(donation)}
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Donation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>Review donation information and proof of payment</DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Donor Name</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedDonation.isAnonymous ? "Anonymous Donor" : selectedDonation.donor}
                  </p>
                </div>
                <div>
                  <Label>Campaign</Label>
                  <p className="text-sm font-medium mt-1">{selectedDonation.campaign}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    ₱{selectedDonation.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-sm font-medium mt-1">
                    {new Date(selectedDonation.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
              </div>
              <div>
                <Label>Proof of Payment</Label>
                <div className="mt-2 border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    {selectedDonation.proofUrl ? (
                      <span>File: {selectedDonation.proofUrl}</span>
                    ) : (
                      "No proof uploaded"
                    )}
                  </p>
                  {selectedDonation.proofUrl && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="mr-2 h-4 w-4" />
                      Download Proof
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedDonation?.status === 'pending' && (
              <>
                <Button variant="outline" onClick={() => openRejectDialog(selectedDonation)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => {
                  handleConfirm(selectedDonation.id);
                  setIsViewDialogOpen(false);
                }}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </>
            )}
            {selectedDonation?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Donation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Donation</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this donation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Invalid proof of payment, duplicate submission, etc."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRejectDialogOpen(false);
              setRejectReason("");
            }}>
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
