import { useState } from "react";
import { Plus, Upload, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FundUsage {
  id: number;
  campaign: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
}

export default function FundTracking() {
  const [fundUsages, setFundUsages] = useState<FundUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    campaign: "",
    category: "",
    amount: "",
    description: "",
    date: "",
    receipt: null as File | null
  });

  const categories = [
    "School Supplies",
    "Medicine",
    "Food",
    "Transportation",
    "Utilities",
    "Salaries",
    "Equipment",
    "Other"
  ];

  const campaigns = [
    "Education Fund 2024",
    "Medical Assistance",
    "Food Drive",
    "Emergency Relief"
  ];

  const handleAdd = () => {
    const newUsage: FundUsage = {
      id: fundUsages.length + 1,
      campaign: formData.campaign,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      receiptUrl: formData.receipt?.name
    };

    setFundUsages([newUsage, ...fundUsages]);
    toast.success("Fund usage logged successfully");
    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      campaign: "",
      category: "",
      amount: "",
      description: "",
      date: "",
      receipt: null
    });
  };

  const totalExpenses = fundUsages.reduce((sum, usage) => sum + usage.amount, 0);

  const expensesByCategory = categories.map(cat => ({
    category: cat,
    total: fundUsages.filter(u => u.category === cat).reduce((sum, u) => sum + u.amount, 0)
  })).filter(item => item.total > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fund Tracking</h1>
          <p className="text-muted-foreground text-sm">
            Log and track how donations are being used
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Expense
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logged Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fundUsages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expensesByCategory.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Breakdown of fund usage by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expensesByCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <div className="font-bold">₱{item.total.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fund Usage Log */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Usage Log</CardTitle>
          <CardDescription>Detailed record of all expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundUsages.map((usage) => (
                <TableRow key={usage.id}>
                  <TableCell>{new Date(usage.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{usage.campaign}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{usage.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm line-clamp-2">{usage.description}</p>
                  </TableCell>
                  <TableCell className="font-bold">₱{usage.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {usage.receiptUrl ? (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">No receipt</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Fund Usage Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Fund Usage</DialogTitle>
            <DialogDescription>
              Record how donation funds were used for transparency
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign *</Label>
                <Select value={formData.campaign} onValueChange={(value) => setFormData({ ...formData, campaign: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign} value={campaign}>
                        {campaign}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what the funds were used for..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Upload Receipt/Proof</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFormData({ ...formData, receipt: e.target.files?.[0] || null })}
                />
                {formData.receipt && (
                  <Badge variant="secondary">{formData.receipt.name}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload receipt or proof of purchase (PDF, JPG, PNG)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Log Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
