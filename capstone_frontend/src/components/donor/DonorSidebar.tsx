import { Home, Heart, History, TrendingUp, User, Info, DollarSign } from "lucide-react";
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
  { title: "Home", url: "/donor", icon: Home },
  { title: "Browse Charities", url: "/donor/charities", icon: Heart },
  { title: "Make Donation", url: "/donor/donate", icon: DollarSign },
  { title: "Donation History", url: "/donor/history", icon: History },
  { title: "Fund Transparency", url: "/donor/transparency", icon: TrendingUp },
  { title: "Profile", url: "/donor/profile", icon: User },
  { title: "About", url: "/donor/about", icon: Info },
];

export const DonorSidebar = () => {
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
              <Heart className="h-6 w-6 text-sidebar-primary" />
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
                      end={item.url === "/donor"}
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
