"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import {
  Crown,
  Gauge,
  ListMusic,
  LogOut,
  Menu,
  NotebookPen,
  Puzzle,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, logout, queryKeys } from "@/lib/api";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/overview", icon: Gauge },
  { label: "User List", href: "/user-list", icon: UserRound },
  { label: "Quiz Organizer", href: "/quiz-organizer", icon: Puzzle },
  { label: "Archetype Generator", href: "/archetype-generator", icon: Crown },
  { label: "Journal Organizer", href: "/journal-organizer", icon: NotebookPen },
  { label: "Meditate Organizer", href: "/meditate-organizer", icon: ListMusic },
  { label: "Subscription", href: "/subscription", icon: Crown },
  { label: "Settings", href: "/settings", icon: Settings },
];

const navItemStyles =
  "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors";

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch {
      // Server logout can fail silently because signOut clears client session.
    } finally {
      await signOut({ callbackUrl: "/login" });
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const avatarUrl = profileQuery.data?.avatar?.url || session?.user?.avatar?.url;
  const userName = profileQuery.data?.name || session?.user?.name || "Admin";
  const role = profileQuery.data?.role || session?.role || "admin";

  return (
    <div className="min-h-screen bg-app-surface">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transform border-r border-white/10 bg-app-navy text-white transition-transform duration-200 ease-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center px-6 pb-4 pt-5">
            <Link href="/overview" className="rounded-xl border border-white/15 p-1">
              <Image
                src="/brand-logo.png"
                alt="GeistGlow"
                width={92}
                height={92}
                className="h-[92px] w-[92px] rounded-lg object-cover"
                priority
              />
            </Link>
            {/* <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/15 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button> */}
          </div>

          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    navItemStyles,
                    isActive
                      ? "bg-white text-app-navy"
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-2 pb-6">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              disabled={isLoggingOut}
              className={cn(
                navItemStyles,
                "w-full text-white/90 hover:bg-white/10 hover:text-white disabled:opacity-50",
              )}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[88px] items-center justify-between bg-app-navy px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/15 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Avatar
              src={avatarUrl}
              name={userName}
              className="h-9 w-9 border border-white/30"
              fallbackClassName="bg-white/20 text-white"
            />
            <div className="text-right text-sm leading-tight">
              <p className="font-semibold text-white">{userName}</p>
              <p className="text-white/70">@{role}</p>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] px-3 py-4 sm:px-5 sm:py-5 md:px-7 md:py-6">
          {children}
        </main>
      </div>

      {isLogoutModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-xl">Confirm Logout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-center text-sm text-app-body">
                Are you sure you want to logout?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsLogoutModalOpen(false)}
                  disabled={isLoggingOut}
                >
                  No
                </Button>
                <Button type="button" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "Logging out..." : "Yes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
