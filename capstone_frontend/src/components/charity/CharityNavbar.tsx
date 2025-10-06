import { NavLink, useNavigate } from "react-router-dom";
import { Building2, Moon, Sun, User, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

export const CharityNavbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CharityHub</span>
          </div>

          {/* Center Navigation - Facebook Style */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/charity"
              end
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "hover:bg-muted"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/charity/posts"
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "hover:bg-muted"
                }`
              }
            >
              Posts
            </NavLink>
            <NavLink
              to="/charity/campaigns"
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "hover:bg-muted"
                }`
              }
            >
              Campaigns
            </NavLink>
            <NavLink
              to="/charity/donations"
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "hover:bg-muted"
                }`
              }
            >
              Donations
            </NavLink>
            <NavLink
              to="/charity/fund-tracking"
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "hover:bg-muted"
                }`
              }
            >
              Funds
            </NavLink>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {user?.name || 'Charity Admin'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/charity/organization')} className="cursor-pointer">
                  Organization Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/charity/profile')} className="cursor-pointer">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/charity/settings')} className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
