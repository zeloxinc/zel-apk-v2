import type { NavItem } from "./nav-types";

export const cashierNav: NavItem[] = [
  {
    label: "POS",
    href: "/dashboard/sales/pos",
    icon: "ScanLine",
    mobileLabel: "POS",
  },
  {
    label: "Sales",
    href: "/dashboard/sales",
    icon: "Receipt",
    mobileLabel: "Sales",
  },
];
