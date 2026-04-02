"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CardsSkeleton } from "@/components/shared/loading-blocks";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSubscriptionPlans,
  queryKeys,
  toggleSubscriptionPlan,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 2;

const fallbackFeatures = ["Training Access", "Community Chat", "Trading Signals", "Email Support"];

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const plansQuery = useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: getSubscriptionPlans,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "active" | "inactive" | "delete" }) =>
      toggleSubscriptionPlan(id, action),
    onSuccess: (_, variables) => {
      const actionText =
        variables.action === "delete" ? "deleted" : variables.action === "active" ? "activated" : "inactivated";
      toast.success(`Plan ${actionText}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const plans = plansQuery.data;
  const totalPages = Math.max(1, Math.ceil((plans?.length || 0) / PAGE_SIZE));
  const paginatedPlans = useMemo(
    () => (plans ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, plans],
  );

  return (
    <div className="fade-up">
      <PageHeader
        title="Flexible Plan"
        subtitle="Create a plan that works best for your users"
        actions={
          <Link href="/subscription/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Plan
            </Button>
          </Link>
        }
      />

      {plansQuery.isLoading ? <CardsSkeleton count={2} /> : null}

      {!plansQuery.isLoading ? (
        <section className="grid gap-5 md:grid-cols-2">
          {paginatedPlans.map((plan, index) => {
            const features = plan.features.length ? plan.features : fallbackFeatures;
            const highlight = index % 2 === 0;
            const cardTheme = highlight
              ? "bg-[#adc4f4] text-white"
              : "bg-[#be9cef] text-white";

            return (
              <Card key={plan._id} className={cardTheme}>
                <CardContent className="space-y-5 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white/20 p-2">
                        {highlight ? <Sparkles className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
                      </div>
                      <h3 className="text-3xl font-semibold">{plan.name}</h3>
                    </div>
                    <Badge variant={plan.isActive ? "success" : "warning"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-5xl font-semibold">
                      {formatCurrency(plan.priceMonthly)}
                      <span className="ml-2 text-xl font-medium text-white/80">/month</span>
                    </p>
                    <p className="mt-1 text-lg text-white/85">
                      {formatCurrency(plan.priceYearly)} /year
                    </p>
                  </div>

                  <div className="border-t border-white/35 pt-4">
                    <p className="mb-2 text-3xl font-semibold">What You Get</p>
                    <ul className="space-y-2 text-base text-white/90">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link href={`/subscription/new?planId=${plan._id}`} className="w-full">
                      <Button fullWidth>Edit</Button>
                    </Link>
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() =>
                        actionMutation.mutate({
                          id: plan._id,
                          action: plan.isActive ? "inactive" : "active",
                        })
                      }
                    >
                      {plan.isActive ? "Inactivate" : "Activate"}
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    fullWidth
                    className="gap-2"
                    onClick={() => {
                      if (!window.confirm("Delete this subscription plan?")) return;
                      actionMutation.mutate({ id: plan._id, action: "delete" });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Plan
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : null}

      {!plansQuery.isLoading && !(plans?.length || 0) ? (
        <Card>
          <CardContent className="py-12 text-center text-app-muted">
            No subscription plan found. Create your first plan.
          </CardContent>
        </Card>
      ) : null}

      <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
