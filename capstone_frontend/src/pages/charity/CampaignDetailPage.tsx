import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  getCampaign,
  pauseCampaign,
  resumeCampaign,
  closeCampaign,
} from "@/services/apiCharity";
import type { CampaignDetail } from "@/types/charity";
import { Edit, Pause, Play, StopCircle, Download, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { toast } from "@/hooks/use-toast";

/**
 * Campaign Detail Page
 * Shows campaign info, progress, media gallery, donor breakdown, and actions
 */
const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"pause" | "resume" | "close" | null>(null);

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadCampaign = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getCampaign(id);
      setCampaign(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!id || !actionType) return;
    try {
      if (actionType === "pause") {
        await pauseCampaign(id);
        toast({ title: "Success", description: "Campaign paused" });
      } else if (actionType === "resume") {
        await resumeCampaign(id);
        toast({ title: "Success", description: "Campaign resumed" });
      } else if (actionType === "close") {
        await closeCampaign(id);
        toast({ title: "Success", description: "Campaign closed" });
      }
      loadCampaign();
      setActionDialogOpen(false);
      setActionType(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Action failed",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-lg space-y-lg">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-lg">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-2xl">
            <AlertCircle className="h-12 w-12 text-destructive mb-md" />
            <p className="text-lg font-medium">Campaign not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (campaign.raised / campaign.goal) * 100;
  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))"];

  return (
    <div className="p-lg space-y-lg">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-sm">{campaign.title}</CardTitle>
              <Badge
                variant="outline"
                className={
                  campaign.status === "active"
                    ? "bg-success/10 text-success"
                    : campaign.status === "paused"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }
              >
                {campaign.status}
              </Badge>
            </div>
            <div className="flex gap-sm">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-xs" />
                Edit
              </Button>
              {campaign.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActionType("pause");
                    setActionDialogOpen(true);
                  }}
                >
                  <Pause className="h-4 w-4 mr-xs" />
                  Pause
                </Button>
              )}
              {campaign.status === "paused" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActionType("resume");
                    setActionDialogOpen(true);
                  }}
                >
                  <Play className="h-4 w-4 mr-xs" />
                  Resume
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionType("close");
                  setActionDialogOpen(true);
                }}
              >
                <StopCircle className="h-4 w-4 mr-xs" />
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-md">
          <div className="space-y-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {progress.toFixed(1)}% of goal reached
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-lg lg:grid-cols-2">
        {/* Description & Media */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            {campaign.mediaGallery && campaign.mediaGallery.length > 0 && (
              <div className="grid grid-cols-2 gap-sm">
                {campaign.mediaGallery.slice(0, 4).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Campaign media ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-md border border-border"
                  />
                ))}
              </div>
            )}
            <div>
              <h3 className="font-medium mb-sm">Description</h3>
              <p className="text-sm text-muted-foreground">{campaign.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-md pt-md border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="text-sm font-medium">
                  {new Date(campaign.deadline).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donor Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.donorBreakdown && campaign.donorBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={campaign.donorBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.range}: ${entry.count}`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="totalAmount"
                  >
                    {campaign.donorBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-lg">
                No donor data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Donations</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-xs" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-md">
            {campaign.recentDonations && campaign.recentDonations.length > 0 ? (
              campaign.recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between border-b border-border pb-md last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{donation.donorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(donation.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${donation.amount.toLocaleString()}</p>
                    <Badge
                      variant="outline"
                      className={
                        donation.status === "confirmed"
                          ? "bg-success/10 text-success"
                          : donation.status === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {donation.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-lg">
                No donations yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "pause"
                ? "Pause Campaign"
                : actionType === "resume"
                ? "Resume Campaign"
                : "Close Campaign"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "pause"
                ? "This will temporarily stop accepting new donations."
                : actionType === "resume"
                ? "This will resume accepting donations."
                : "This action will permanently close the campaign and stop all donations."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignDetailPage;
