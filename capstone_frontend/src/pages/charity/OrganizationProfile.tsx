import { useState, useEffect } from "react";
import { Building2, Upload, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/auth";

interface CharityData {
  name: string;
  acronym?: string;
  mission: string;
  vision?: string;
  goals?: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  logo_path?: string;
  cover_image?: string;
  documents?: any[];
  services?: string;
}

export default function OrganizationProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [charityData, setCharityData] = useState<CharityData | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    mission: "",
    vision: "",
    goals: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    address: "",
    services: "",
  });

  useEffect(() => {
    loadCharityData();
  }, []);

  const loadCharityData = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (response.ok) {
        const userData = await response.json();
        const charity = userData?.charity;

        if (charity) {
          setCharityData(charity);
          setFormData({
            name: charity.name || "",
            acronym: charity.acronym || "",
            mission: charity.mission || "",
            vision: charity.vision || "",
            goals: charity.goals || "",
            contact_email: charity.contact_email || "",
            contact_phone: charity.contact_phone || "",
            website: charity.website || "",
            address: charity.address || "",
            services: charity.services || "",
          });
        }
      }
    } catch (error) {
      console.error('Error loading charity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Logo uploaded successfully");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const updateFormData = new FormData();
      updateFormData.append('name', formData.name);
      updateFormData.append('acronym', formData.acronym);
      updateFormData.append('mission', formData.mission);
      updateFormData.append('vision', formData.vision);
      updateFormData.append('goals', formData.goals);
      updateFormData.append('contact_email', formData.contact_email);
      updateFormData.append('contact_phone', formData.contact_phone);
      updateFormData.append('website', formData.website);
      updateFormData.append('address', formData.address);
      updateFormData.append('services', formData.services);

      if (logoPreview) {
        // Convert base64 to file if needed
        const response = await fetch(logoPreview);
        const blob = await response.blob();
        updateFormData.append('logo', blob, 'logo.jpg');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: updateFormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update organization profile');
      }

      const updatedUser = await response.json();
      toast.success("Organization profile updated successfully");
      setIsEditing(false);

      // Note: The UI will automatically reflect changes through React state updates

    } catch (error) {
      console.error('Error updating organization profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update organization profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original charity data
    if (charityData) {
      setFormData({
        name: charityData.name || "",
        acronym: charityData.acronym || "",
        mission: charityData.mission || "",
        vision: charityData.vision || "",
        goals: charityData.goals || "",
        contact_email: charityData.contact_email || "",
        contact_phone: charityData.contact_phone || "",
        website: charityData.website || "",
        address: charityData.address || "",
        services: charityData.services || "",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Profile</h1>
          <p className="text-muted-foreground text-sm">
            Manage your charity organization information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Logo</CardTitle>
          <CardDescription>Upload your charity's logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-32 w-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-full w-full object-cover rounded-lg" />
              ) : charityData?.logo_path ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/storage/${charityData.logo_path}`}
                  alt="Organization Logo"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <Building2 className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            {isEditing && (
              <div>
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </div>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG up to 2MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Organization details and registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acronym">Acronym</Label>
              <Input
                id="acronym"
                value={formData.acronym}
                onChange={(e) => handleInputChange('acronym', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <Card>
        <CardHeader>
          <CardTitle>Mission, Vision & Goals</CardTitle>
          <CardDescription>Your organization's purpose and objectives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mission">Mission Statement *</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Vision Statement</Label>
            <Textarea
              id="vision"
              value={formData.vision}
              onChange={(e) => handleInputChange('vision', e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Services Provided</Label>
            <Textarea
              id="services"
              value={formData.services}
              onChange={(e) => handleInputChange('services', e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How people can reach your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Your organization's verification details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-muted-foreground">
                Your organization verification status
              </p>
            </div>
            <Badge className="bg-green-600">Verified</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
