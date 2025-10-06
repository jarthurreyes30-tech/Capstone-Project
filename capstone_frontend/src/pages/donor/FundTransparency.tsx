import { useEffect, useState } from "react";
import { TrendingUp, Download, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { authService } from "@/services/auth";

interface FundUsage {
  id: number;
  charity: string;
  campaign: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
}

interface Campaign {
  id: number;
  title: string;
  charity: string;
  target_amount: number;
  current_amount: number;
  spent_amount: number;
}

export default function FundTransparency() {
  const [selectedCharity, setSelectedCharity] = useState("all");
  const [selectedUsage, setSelectedUsage] = useState<FundUsage | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [fundUsages, setFundUsages] = useState<FundUsage[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTransparency();
  }, []);

  const fetchTransparency = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        toast.info('Please log in to view your transparency dashboard');
        return;
      }
      const res = await fetch(`${API_URL}/api/me/transparency`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to load transparency data');
      const payload = await res.json();

      const apiCampaigns = (payload.campaigns ?? payload.data?.campaigns ?? []) as any[];
      const apiUsages = (payload.fund_usages ?? payload.data?.fund_usages ?? []) as any[];

      setCampaigns(apiCampaigns.map((c) => ({
        id: c.id,
        title: c.title ?? c.name ?? 'Campaign',
        charity: c.charity?.name ?? c.charity_name ?? 'Charity',
        target_amount: c.target_amount ?? c.target ?? 0,
        current_amount: c.current_amount ?? c.raised ?? 0,
        spent_amount: c.spent_amount ?? c.spent ?? 0,
      })));

      setFundUsages(apiUsages.map((u) => ({
        id: u.id,
        charity: u.charity?.name ?? u.charity_name ?? 'Charity',
        campaign: u.campaign?.title ?? u.campaign_name ?? 'General',
        category: u.category ?? 'General',
        amount: u.amount ?? 0,
        description: u.description ?? '',
        date: u.date ?? u.created_at ?? new Date().toISOString(),
        receiptUrl: u.receipt_url ?? u.receiptUrl ?? null,
      })));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to load transparency data');
    }
  };

  const charities = ["all", ...new Set(fundUsages.map(f => f.charity))];

  const filteredUsages = selectedCharity === "all"
    ? fundUsages
    : fundUsages.filter(f => f.charity === selectedCharity);

  const getProgress = (raised: number, target: number) => {
    return (raised / target) * 100;
  };

  const getUtilization = (spent: number, raised: number) => {
    return raised > 0 ? (spent / raised) * 100 : 0;
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Fund Transparency</h1>
          <p className="text-xl text-muted-foreground">
            See exactly how your donations are being used
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Campaign Progress */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Campaign Progress</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  <CardDescription>{campaign.charity}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Fundraising Progress</span>
                      <span className="font-medium">
                        {getProgress(campaign.current_amount, campaign.target_amount).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={getProgress(campaign.current_amount, campaign.target_amount)} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₱{campaign.current_amount.toLocaleString()} raised</span>
                      <span>₱{campaign.target_amount.toLocaleString()} goal</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Fund Utilization</span>
                      <span className="font-medium">
                        {getUtilization(campaign.spent_amount, campaign.current_amount).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={getUtilization(campaign.spent_amount, campaign.current_amount)} className="bg-green-100" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₱{campaign.spent_amount.toLocaleString()} spent</span>
                      <span>₱{campaign.current_amount.toLocaleString()} available</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="font-bold text-sm">₱{campaign.target_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Raised</p>
                      <p className="font-bold text-sm text-green-600">₱{campaign.current_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="font-bold text-sm text-blue-600">₱{campaign.spent_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Fund Usage Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fund Usage Details</CardTitle>
                <CardDescription>Detailed breakdown of how funds are being used</CardDescription>
              </div>
              <div className="flex gap-2">
                <Tabs value={selectedCharity} onValueChange={setSelectedCharity}>
                  <TabsList>
                    {charities.map(charity => (
                      <TabsTrigger key={charity} value={charity}>
                        {charity === "all" ? "All Charities" : charity}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Charity</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsages.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>{new Date(usage.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{usage.charity}</TableCell>
                    <TableCell>{usage.campaign}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{usage.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm line-clamp-2">{usage.description}</p>
                    </TableCell>
                    <TableCell className="font-bold">₱{usage.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUsage(usage);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {usage.receiptUrl && (
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transparency Score removed until real data is available */}
      </div>

      {/* Usage Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fund Usage Details</DialogTitle>
            <DialogDescription>Complete information about this expense</DialogDescription>
          </DialogHeader>
          {selectedUsage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Charity</p>
                  <p className="font-medium">{selectedUsage.charity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Campaign</p>
                  <p className="font-medium">{selectedUsage.campaign}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <Badge variant="outline">{selectedUsage.category}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedUsage.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-green-600">₱{selectedUsage.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{selectedUsage.description}</p>
              </div>
              {selectedUsage.receiptUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Receipt</p>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
