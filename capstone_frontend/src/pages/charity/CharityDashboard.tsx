import { useEffect, useState } from "react";
import { DollarSign, Megaphone, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authService } from "@/services/auth";
export default function CharityDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    charitiesSupported: 0,
    impactScore: 0,
    activeCampaigns: 0,
    pendingConfirmations: 0,
    verificationStatus: 'pending' as 'pending' | 'approved' | 'rejected'
  });

  const [verificationStatus, setVerificationStatus] = useState<'pending'|'approved'|'rejected'>('pending');

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const token = authService.getToken();
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        if (!res.ok) return;
        const me = await res.json();
        const status = me?.charity?.verification_status as 'pending'|'approved'|'rejected' | undefined;
        if (status) setVerificationStatus(status);
      } catch {}
    };
    loadStatus();
  }, []);

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

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Verification</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening with your charity
        </p>
      </div>

      {/* Verification Status Alert */}
      {verificationStatus === 'pending' && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-900 dark:text-yellow-100">
                Verification Pending
              </CardTitle>
            </div>
            <CardDescription className="text-yellow-800 dark:text-yellow-200">
              Your charity is currently under review by our admin team. You can still manage your profile and prepare campaigns.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDonations} donations received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Running campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Confirmations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingConfirmations}</div>
            <p className="text-xs text-muted-foreground">
              Require your action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getVerificationBadge(verificationStatus)}
            <p className="text-xs text-muted-foreground mt-2">
              Organization status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your charity operations</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate('/charity/campaigns')}>
            <Megaphone className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
          <Button variant="outline" onClick={() => navigate('/charity/donations')}>
            View Donations
          </Button>
          <Button variant="outline" onClick={() => navigate('/charity/fund-tracking')}>
            Log Fund Usage
          </Button>
        </CardContent>
      </Card>

      {/* Recent Donations - removed demo content */}
    </div>
  );
}
