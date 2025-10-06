import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import { ThemeProvider } from "./components/ThemeProvider";

// Public Pages
import Index from "./pages/Index";
import PublicCharities from "./pages/PublicCharities";
import CharityDetail from "./pages/CharityDetail";
import PublicAbout from "./pages/PublicAbout";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Register from "./pages/auth/Register";
import RegisterDonor from "./pages/auth/RegisterDonor";
import RegisterCharity from "./pages/auth/RegisterCharity";

// Donor Components
import { DonorLayout } from "./components/donor/DonorLayout";
// Donor pages
import DonorDashboard from "./pages/donor/DonorDashboard";
import NewsFeed from "./pages/donor/NewsFeed";
import MakeDonation from "./pages/donor/MakeDonation";
import DonationHistory from "./pages/donor/DonationHistory";
import FundTransparency from "./pages/donor/FundTransparency";
import DonorProfile from "./pages/donor/DonorProfile";
import About from "./pages/donor/About";
import BrowseCharities from "./pages/donor/BrowseCharities";
import Notifications from "./pages/donor/Notifications";
import CharityProfile from "./pages/donor/CharityProfile";

// Charity Components
import { CharityLayout } from "./components/charity/CharityLayout";
import CharityDashboard from "./pages/charity/CharityDashboard";
import OrganizationProfile from "./pages/charity/OrganizationProfile";
import CampaignManagement from "./pages/charity/CampaignManagement";
import DonationManagement from "./pages/charity/DonationManagement";
import FundTracking from "./pages/charity/FundTracking";
import CharityPosts from "./pages/charity/CharityPosts";
import CharitySettings from "./pages/charity/CharitySettings";

// --- 1. IMPORT THE NEW ADMIN COMPONENTS ---
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Charities from "./pages/admin/Charities";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/admin/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="charityhub-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/charities" element={<PublicCharities />} />
            <Route path="/charities/:id" element={<CharityDetail />} />
            <Route path="/about" element={<PublicAbout />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/register/donor" element={<RegisterDonor />} />
            <Route path="/auth/register/charity" element={<RegisterCharity />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            
            {/* Donor Dashboard */}
            <Route 
              path="/donor"
              element={
                <ProtectedRoute>
                  <RoleGate allow={['donor']}>
                    <DonorLayout />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<DonorDashboard />} />
              <Route path="news-feed" element={<NewsFeed />} />
              <Route path="donate" element={<MakeDonation />} />
              <Route path="history" element={<DonationHistory />} />
              <Route path="transparency" element={<FundTransparency />} />
              <Route path="profile" element={<DonorProfile />} />
              <Route path="charities" element={<BrowseCharities />} />
              <Route path="charities/:id" element={<CharityProfile />} />
              <Route path="about" element={<About />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Charity Admin Dashboard */}
            <Route 
              path="/charity"
              element={
                <ProtectedRoute>
                  <RoleGate allow={['charity_admin']}>
                    <CharityLayout />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<CharityDashboard />} />
              <Route path="organization" element={<OrganizationProfile />} />
              <Route path="posts" element={<CharityPosts />} />
              <Route path="campaigns" element={<CampaignManagement />} />
              <Route path="donations" element={<DonationManagement />} />
              <Route path="fund-tracking" element={<FundTracking />} />
              <Route path="profile" element={<CharityProfile />} />
              <Route path="settings" element={<CharitySettings />} />
            </Route>

            {/* --- 2. SETUP THE NEW ADMIN DASHBOARD LAYOUT AND ROUTES --- */}
            <Route 
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleGate allow={['admin']}>
                    <AdminLayout />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="charities" element={<Charities />} />
              <Route path="logs" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;