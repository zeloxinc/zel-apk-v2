import type { UserRole, NavItem } from "./nav-types";
import { ownerNav } from "./owner-nav";
import { cashierNav } from "./cashier-nav";

export function getNavForRole(role: UserRole): NavItem[] {
  return role === "Owner" ? ownerNav : cashierNav;
}

export function getMobileNav(role: UserRole): NavItem[] {
  if (role === "Cashier") return cashierNav;
  return ownerNav;
}

export type { UserRole, NavItem };
