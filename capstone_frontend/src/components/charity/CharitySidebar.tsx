import { LayoutDashboard, Building2, Megaphone, DollarSign, TrendingUp, User, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/charity", icon: LayoutDashboard },
  { title: "Organization Profile", url: "/charity/organization", icon: Building2 },
  { title: "Campaign Management", url: "/charity/campaigns", icon: Megaphone },
  { title: "Donation Management", url: "/charity/donations", icon: DollarSign },
  { title: "Fund Tracking", url: "/charity/fund-tracking", icon: TrendingUp },
  { title: "Profile", url: "/charity/profile", icon: User },
  { title: "Settings", url: "/charity/settings", icon: Settings },
];

export const CharitySidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Building2 className="h-6 w-6 text-sidebar-primary" />
              {!isCollapsed && (
                <span className="font-semibold text-lg text-sidebar-foreground">
                  CharityHub
                </span>
              )}
            </motion.div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/charity"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
