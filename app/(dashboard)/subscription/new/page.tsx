"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  queryKeys,
  updateSubscriptionPlan,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";
import { toArray } from "@/lib/utils";

type FormState = {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  features: string;
  description: string;
  isActive: boolean;
};

const defaultState: FormState = {
  name: "",
  priceMonthly: "",
  priceYearly: "",
  features: "",
  description: "",
  isActive: true,
};

function SubscriptionFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const planId = searchParams.get("planId");
  const [draftForm, setDraftForm] = useState<FormState>(defaultState);
  const [isDirty, setIsDirty] = useState(false);

  const plansQuery = useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: getSubscriptionPlans,
  });

  const selectedPlan = useMemo(
    () => plansQuery.data?.find((item) => item._id === planId),
    [planId, plansQuery.data],
  );

  const initialForm = useMemo<FormState>(() => {
    if (!selectedPlan) return defaultState;
    return {
      name: selectedPlan.name,
      priceMonthly: String(selectedPlan.priceMonthly),
      priceYearly: String(selectedPlan.priceYearly),
      features: selectedPlan.features.join(", "),
      description: selectedPlan.description || "",
      isActive: selectedPlan.isActive,
    };
  }, [selectedPlan]);

  const form = isDirty ? draftForm : initialForm;

  const createMutation = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      toast.success("Plan created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      setDraftForm(defaultState);
      setIsDirty(false);
      router.push("/subscription");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateSubscriptionPlan>[1];
    }) => updateSubscriptionPlan(id, payload),
    onSuccess: () => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      setDraftForm(defaultState);
      setIsDirty(false);
      router.push("/subscription");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const setField = (key: keyof FormState, value: string | boolean) => {
    setDraftForm((prev) => ({
      ...(isDirty ? prev : initialForm),
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      priceMonthly: Number(form.priceMonthly) || 0,
      priceYearly: Number(form.priceYearly) || 0,
      features: toArray(form.features),
      description: form.description.trim(),
      isActive: form.isActive,
    };

    if (planId) {
      updateMutation.mutate({ id: planId, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="fade-up">
      <PageHeader
        title={planId ? "Edit Subscription Plan" : "Create New Subscription Plan"}
        subtitle="Configure pricing and plan features"
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Subscription Plan Name</Label>
              <Input
                id="plan-name"
                placeholder="Premium"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price-monthly">Price for Month</Label>
                <Input
                  id="price-monthly"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.priceMonthly}
                  onChange={(event) => setField("priceMonthly", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-yearly">Price for Year</Label>
                <Input
                  id="price-yearly"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.priceYearly}
                  onChange={(event) => setField("priceYearly", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features</Label>
              <Input
                id="features"
                placeholder="Training Access, Community Chat, Trading Signals"
                value={form.features}
                onChange={(event) => setField("features", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional plan description"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                className="min-h-[110px]"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-app-heading">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setField("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-app-border text-app-primary focus:ring-app-primary/40"
              />
              Active Plan
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <Button type="submit" fullWidth disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Link href="/subscription" className="w-full">
                <Button variant="secondary" fullWidth type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionFormPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] rounded-xl bg-slate-100" />}>
      <SubscriptionFormContent />
    </Suspense>
  );
}

