"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CheckCircle2, Circle, Filter } from "lucide-react";
import { getAdminDashboard, queryKeys } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCardsSkeleton, TableSkeleton } from "@/components/shared/loading-blocks";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pieColors = ["#34c5e8", "#fd8585", "#8f7cf8"];
const barColors = ["#f9ce5d", "#8eb3f5", "#b181f1", "#f8a796", "#6394ef", "#aca6ff", "#f87273"];
const filterOptions = [
  { value: "daily", label: "Daily" },
  { value: "week", label: "week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

type FilterRange = (typeof filterOptions)[number]["value"];

type FilterDropdownProps = {
  value: FilterRange;
  onChange: (value: FilterRange) => void;
  align?: "left" | "right";
};

function FilterDropdown({ value, onChange, align = "right" }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <Button
        variant="secondary"
        size="sm"
        className="gap-2 border-[#5f89d1] bg-[#0f458e] px-5 text-white hover:bg-[#0f458e]/90"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Filter className="h-4 w-4" />
        Filter
      </Button>
      {open ? (
        <div
          className={`absolute top-[calc(100%+10px)] z-30 flex w-[116px] flex-col gap-3 rounded-xl bg-[#0f458e] p-3 shadow-lg ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          {filterOptions.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className="flex items-center justify-between rounded-md border border-white/55 bg-[#1d5db4] px-3 py-2 text-left text-sm text-white hover:bg-[#2a69be]"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
                {active ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : (
                  <Circle className="h-4 w-4 text-white" />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function OverviewPage() {
  const [range, setRange] = useState<FilterRange>("week");
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getAdminDashboard,
  });

  const dashboardData = dashboardQuery.data;

  const pieData = [
    {
      name: "Meditation Completed",
      value: dashboardData?.overview.totalMeditationCompleted || 0,
    },
    {
      name: "Journal Entries",
      value: dashboardData?.overview.totalJournalEntries || 0,
    },
    {
      name: "Quiz Taken",
      value: dashboardData?.overview.totalQuizTaken || 0,
    },
  ];

  const barData = useMemo(() => {
    const weeklySeries = dashboardData?.userActivity.journalEntries ?? [];
    if (!weeklySeries.length) return [];

    if (range === "daily") {
      const last = weeklySeries[weeklySeries.length - 1];
      return [
        {
          day: "Today",
          value: last.count,
          fill: barColors[0],
        },
      ];
    }

    if (range === "month") {
      const bucketLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const grouped = [0, 0, 0, 0];
      weeklySeries.forEach((point, index) => {
        const bucketIndex = Math.min(3, Math.floor((index / weeklySeries.length) * 4));
        grouped[bucketIndex] += point.count;
      });
      return grouped.map((value, index) => ({
        day: bucketLabels[index],
        value,
        fill: barColors[index % barColors.length],
      }));
    }

    if (range === "year") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthMap = new Map<number, number>();
      weeklySeries.forEach((point) => {
        const month = new Date(point.date).getMonth();
        monthMap.set(month, (monthMap.get(month) || 0) + point.count);
      });

      return monthNames.map((day, index) => ({
        day,
        value: monthMap.get(index) || 0,
        fill: barColors[index % barColors.length],
      }));
    }

    return weeklySeries.map((item, index) => ({
      day: item.day,
      value: item.count,
      fill: barColors[index % barColors.length],
    }));
  }, [range, dashboardData?.userActivity.journalEntries]);

  const stats = [
    {
      title: "Total User",
      value: dashboardData?.overview.totalUsers || 0,
      className: "bg-gradient-to-br from-[#ba6be8] to-[#8a8bf3]",
    },
    {
      title: "Total Quizzes",
      value: dashboardData?.overview.totalQuizzes || 0,
      className: "bg-gradient-to-br from-[#4d72f5] to-[#6a9bff]",
    },
    {
      title: "Active Subscription",
      value: dashboardData?.overview.activeSubscriptionCount || 0,
      className: "bg-gradient-to-br from-[#2895d8] to-[#4eb8ef]",
    },
    {
      title: "Journal Entries",
      value: dashboardData?.overview.totalJournalEntries || 0,
      className: "bg-gradient-to-br from-[#f49f9f] to-[#f88585]",
    },
  ];

  return (
    <div className="fade-up">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back to your admin panel"
        actions={<FilterDropdown value={range} onChange={setRange} />}
      />

      {dashboardQuery.isLoading ? <StatsCardsSkeleton /> : null}

      {!dashboardQuery.isLoading ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.title} className={`text-white ${item.className}`}>
              <CardContent className="space-y-1 pt-5">
                <p className="text-3xl font-semibold">{item.value}</p>
                <p className="text-sm text-white/80">{item.title}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[340px]">
            {dashboardQuery.isLoading ? (
              <div className="h-full animate-pulse rounded-md bg-slate-100" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={0}
                    labelLine={false}
                    label={({ name }) => name}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>User Analysis</CardTitle>
            <FilterDropdown value={range} onChange={setRange} align="left" />
          </CardHeader>
          <CardContent className="h-[340px]">
            {dashboardQuery.isLoading ? (
              <div className="h-full animate-pulse rounded-md bg-slate-100" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.day} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-app-heading">Recent User</h2>
          <Link
            href="/user-list"
            className="text-sm font-semibold text-app-primary hover:text-app-primary-soft"
          >
            See All
          </Link>
        </div>

        {dashboardQuery.isLoading ? <TableSkeleton rows={5} /> : null}

        {!dashboardQuery.isLoading ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Payable</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead className="text-right">Action Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboardData?.recentUsers || []).map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar?.url}
                            name={user.name}
                            className="h-10 w-10 border border-app-border"
                          />
                          <span className="font-medium text-app-heading">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>$ {user.subscription?.plan?.priceMonthly ?? 0}</TableCell>
                      <TableCell>{user.currentPlan || user.subscription?.plan?.name || "Free"}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="active" className="inline-flex">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
