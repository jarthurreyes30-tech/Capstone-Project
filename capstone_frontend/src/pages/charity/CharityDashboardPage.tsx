import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboard } from "@/services/apiCharity";
import type { DashboardData } from "@/types/charity";
import { TrendingUp, Users, FileCheck, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "@/hooks/use-toast";

/**
 * Charity Dashboard Page
 * Shows KPIs, donation chart, recent activity, and quick actions
 */
const CharityDashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboard();
      setData(dashboardData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-lg space-y-lg">
        <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-xs" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-lg">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-2xl">
            <AlertCircle className="h-12 w-12 text-destructive mb-md" />
            <p className="text-lg font-medium mb-sm">Failed to load dashboard</p>
            <p className="text-sm text-muted-foreground mb-lg">{error}</p>
            <Button onClick={loadDashboard}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Total Donations",
      value: `$${data.stats.totalDonations.toLocaleString()}`,
      icon: TrendingUp,
      description: "All time",
    },
    {
      title: "Active Campaigns",
      value: data.stats.activeCampaigns.toString(),
      icon: Users,
      description: "Currently running",
    },
    {
      title: "Pending Proofs",
      value: data.stats.pendingProofs.toString(),
      icon: AlertCircle,
      description: "Awaiting review",
    },
    {
      title: "Verified Documents",
      value: data.stats.verifiedDocuments.toString(),
      icon: FileCheck,
      description: "Approved",
    },
  ];

  return (
    <div className="p-lg space-y-lg">
      {/* KPI Cards */}
      <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-xs">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donations Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Donations Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.donationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-lg lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-md">
              {data.recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-lg">
                  No recent activity
                </p>
              ) : (
                data.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between border-b border-border pb-md last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-xs">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-sm py-xs rounded-full ${
                        activity.status === "confirmed"
                          ? "bg-success/10 text-success"
                          : activity.status === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <Button className="w-full" size="lg">
              Create New Campaign
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              Open Donations Inbox
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              Review Pending Documents
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              Export Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharityDashboardPage;
