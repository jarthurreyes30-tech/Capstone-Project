import { useEffect, useState } from "react";
import { Heart, Upload, CheckCircle, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";

export default function MakeDonation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    charityId: "",
    campaignId: "",
    amount: "",
    customAmount: "",
    donationType: "one-time",
    frequency: "monthly",
    paymentMethod: "gcash",
    message: "",
    isAnonymous: false,
    proofOfPayment: null as File | null
  });
  const [charities, setCharities] = useState<Array<{ id: number; name: string }>>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: number; title: string }>>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    if (formData.charityId) fetchCampaigns(parseInt(formData.charityId, 10));
    else setCampaigns([]);
  }, [formData.charityId]);

  const fetchCharities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/charities`);
      if (!res.ok) throw new Error('Failed to load charities');
      const data = await res.json();
      // backend likely returns array
      setCharities(data.data ?? data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to load charities');
    }
  };

  const fetchCampaigns = async (charityId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/charities/${charityId}/campaigns`);
      if (!res.ok) throw new Error('Failed to load campaigns');
      const data = await res.json();
      setCampaigns(data.data ?? data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to load campaigns');
    }
  };

  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleSubmit = async () => {
    if (!formData.charityId || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) {
        toast.info('Please log in to donate');
        navigate('/auth/login');
        return;
      }

      const isRecurring = formData.donationType === 'recurring';
      const body = {
        charity_id: parseInt(formData.charityId, 10),
        campaign_id: formData.campaignId ? parseInt(formData.campaignId, 10) : undefined,
        amount: parseFloat(formData.amount),
        purpose: 'general',
        is_anonymous: formData.isAnonymous,
        is_recurring: isRecurring,
        recurring_type: isRecurring ? (formData.frequency as 'weekly'|'monthly'|'quarterly') : undefined,
      } as any;

      const res = await fetch(`${API_URL}/api/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to submit donation');
      const donation = await res.json();

      if (!formData.proofOfPayment) {
        toast.success("Donation submitted successfully! Awaiting confirmation.");
        navigate('/donor/history');
        return;
      }

      const fd = new FormData();
      fd.append('file', formData.proofOfPayment);
      fd.append('proof_type', formData.paymentMethod);
      const proofRes = await fetch(`${API_URL}/api/donations/${donation.id}/proof`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });
      if (!proofRes.ok) throw new Error('Donation saved but uploading proof failed');

      toast.success("Donation submitted successfully! Proof uploaded.");
      navigate('/donor/history');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to submit donation');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, proofOfPayment: file });
      toast.success("Proof of payment uploaded");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Make a Donation</h1>
        <p className="text-muted-foreground">
          Your contribution makes a real difference
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="text-sm mt-2">Select</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="text-sm mt-2">Amount</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="text-sm mt-2">Payment</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Charity & Campaign */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Charity & Campaign</CardTitle>
            <CardDescription>Choose where you want to donate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="charity">Charity *</Label>
              <Select value={formData.charityId} onValueChange={(value) => setFormData({ ...formData, charityId: value, campaignId: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a charity" />
                </SelectTrigger>
                <SelectContent>
                  {charities.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign (Optional)</Label>
              <Select value={formData.campaignId} onValueChange={(value) => setFormData({ ...formData, campaignId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="General donation or select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General Donation</SelectItem>
                  {campaigns.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setStep(2)} disabled={!formData.charityId} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Amount & Type */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Donation Amount</CardTitle>
            <CardDescription>Choose your donation amount and type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Donation Type */}
            <div className="space-y-3">
              <Label>Donation Type</Label>
              <RadioGroup value={formData.donationType} onValueChange={(value) => setFormData({ ...formData, donationType: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="cursor-pointer">One-time Donation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring" className="cursor-pointer">Recurring Donation</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Frequency (if recurring) */}
            {formData.donationType === 'recurring' && (
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Suggested Amounts */}
            <div className="space-y-3">
              <Label>Select Amount (₱)</Label>
              <div className="grid grid-cols-3 gap-3">
                {suggestedAmounts.map(amount => (
                  <Button
                    key={amount}
                    variant={formData.amount === amount.toString() ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, amount: amount.toString(), customAmount: "" })}
                  >
                    ₱{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="customAmount">Or Enter Custom Amount</Label>
              <Input
                id="customAmount"
                type="number"
                placeholder="Enter amount"
                value={formData.customAmount}
                onChange={(e) => setFormData({ ...formData, customAmount: e.target.value, amount: e.target.value })}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a message of support..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
              />
            </div>

            {/* Anonymous */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked as boolean })}
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Make this donation anonymous
              </Label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!formData.amount} className="flex-1">
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Complete your donation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Donation Summary</h3>
              <div className="flex justify-between text-sm">
                <span>Charity:</span>
                <span className="font-medium">{formData.charity}</span>
              </div>
              {formData.campaign && (
                <div className="flex justify-between text-sm">
                  <span>Campaign:</span>
                  <span className="font-medium">{formData.campaign}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Type:</span>
                <span className="font-medium capitalize">{formData.donationType}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Amount:</span>
                <span className="text-green-600">₱{parseFloat(formData.amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="gcash" id="gcash" />
                  <Label htmlFor="gcash" className="cursor-pointer flex-1">GCash</Label>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="paymaya" id="paymaya" />
                  <Label htmlFor="paymaya" className="cursor-pointer flex-1">PayMaya</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="cursor-pointer flex-1">Bank Transfer</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Upload Proof */}
            <div className="space-y-2">
              <Label htmlFor="proof">Upload Proof of Payment *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="proof" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {formData.proofOfPayment ? formData.proofOfPayment.name : "Click to upload proof of payment"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, PDF up to 5MB
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.proofOfPayment} className="flex-1">
                <Heart className="mr-2 h-4 w-4" />
                Submit Donation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
