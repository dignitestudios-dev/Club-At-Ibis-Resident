import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  FileEdit,
  Bell,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/requests", label: "My Requests", icon: ListChecks },
      { href: "/requests/new", label: "New Request", icon: PlusCircle },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
  },
];
