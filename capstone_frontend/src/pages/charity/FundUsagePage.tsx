import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import { listFundUsage, createFundUsage } from "@/services/apiCharity";
import type { FundUsageEntry } from "@/types/charity";
import { Plus, Download, Receipt } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Fund Usage Page
 * Form to add fund usage entries and table to view entries
 */
const FundUsagePage = () => {
  const [entries, setEntries] = useState<FundUsageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    campaignId: "",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    loadEntries();
  }, [page, categoryFilter]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await listFundUsage({
        page,
        pageSize: 20,
        category: categoryFilter || undefined,
      });
      setEntries(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.campaignId || !formData.amount || !formData.category || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append("campaignId", formData.campaignId);
    data.append("amount", formData.amount);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("date", formData.date);
    files.forEach((file) => data.append("receipts", file));

    try {
      await createFundUsage(data);
      toast({ title: "Success", description: "Fund usage entry added" });
      setDialogOpen(false);
      setFormData({
        campaignId: "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setFiles([]);
      loadEntries();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add entry",
        variant: "destructive",
      });
    }
  };

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  if (loading && entries.length === 0) {
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
            <CardTitle>Fund Usage</CardTitle>
            <div className="flex gap-sm">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-xs" />
                Export
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-xs" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Summary */}
          <div className="flex items-center justify-between p-md bg-muted rounded-md">
            <span className="text-sm font-medium">Total Expenditure:</span>
            <span className="text-2xl font-bold">
              ${totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-md items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-lg">
                      <p className="text-muted-foreground">No fund usage entries</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.campaignTitle || entry.campaignId}
                      </TableCell>
                      <TableCell>${entry.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{entry.category}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {entry.receiptUrls.length > 0 ? (
                          <div className="flex gap-xs">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {entry.receiptUrls.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
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

      {/* Add Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Fund Usage Entry</DialogTitle>
            <DialogDescription>
              Record how campaign funds were used
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-md py-md">
            <div>
              <Label htmlFor="campaign">Campaign ID *</Label>
              <Input
                id="campaign"
                value={formData.campaignId}
                onChange={(e) =>
                  setFormData({ ...formData, campaignId: e.target.value })
                }
                placeholder="Enter campaign ID"
                className="mt-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="mt-sm"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category" className="mt-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe how funds were used..."
                className="mt-sm"
              />
            </div>
            <div>
              <Label htmlFor="receipts">Receipts</Label>
              <Input
                id="receipts"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) =>
                  setFiles(e.target.files ? Array.from(e.target.files) : [])
                }
                className="mt-sm"
              />
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground mt-xs">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FundUsagePage;
