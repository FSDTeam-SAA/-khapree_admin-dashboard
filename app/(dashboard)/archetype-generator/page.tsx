"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { CardsSkeleton } from "@/components/shared/loading-blocks";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createArchetype, deleteArchetype, getArchetypes, queryKeys } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";
import { toArray } from "@/lib/utils";

const PAGE_SIZE = 6;

type FormState = {
  title: string;
  description: string;
  emotion: string;
  insight: string;
  color: string;
  priority: string;
  linkedQuestionTags: string;
  emoji: File | null;
  attachment: File | null;
};

const defaultForm: FormState = {
  title: "",
  description: "",
  emotion: "",
  insight: "",
  color: "",
  priority: "0",
  linkedQuestionTags: "",
  emoji: null,
  attachment: null,
};

export default function ArchetypeGeneratorPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [page, setPage] = useState(1);

  const archetypesQuery = useQuery({
    queryKey: queryKeys.archetypes,
    queryFn: getArchetypes,
  });

  const createMutation = useMutation({
    mutationFn: createArchetype,
    onSuccess: () => {
      toast.success("Archetype created successfully");
      setForm(defaultForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.archetypes });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArchetype,
    onSuccess: () => {
      toast.success("Archetype deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.archetypes });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const archetypes = archetypesQuery.data;
  const totalPages = Math.max(1, Math.ceil((archetypes?.length || 0) / PAGE_SIZE));
  const paginated = useMemo(
    () => (archetypes ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [archetypes, page],
  );

  const emojiPreview = form.emoji ? URL.createObjectURL(form.emoji) : "";

  const setField = (key: keyof FormState, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => setForm(defaultForm);

  const handlePublish = () => {
    if (!form.title.trim() || !form.description.trim() || !form.emotion.trim()) {
      toast.error("Title, description and emotion are required");
      return;
    }

    if (!form.emoji) {
      toast.error("Emoji image is required");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("emotion", form.emotion.trim());
    payload.append("insight", form.insight.trim());
    payload.append("color", form.color.trim());
    payload.append("priority", form.priority.trim() || "0");
    payload.append("linkedQuestionTags", JSON.stringify(toArray(form.linkedQuestionTags)));
    payload.append("emoji", form.emoji);
    if (form.attachment) {
      payload.append("attachment", form.attachment);
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="fade-up space-y-5">
      <PageHeader
        title="Create New Archetype"
        subtitle="Create emotion archetypes and upload required files"
        actions={
          <Button className="gap-2" onClick={resetForm}>
            <PlusCircle className="h-4 w-4" />
            Add New
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="emotion-title">Emotion title</Label>
            <Input
              id="emotion-title"
              placeholder="The Worried"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emotion-description">Emotion description</Label>
            <Textarea
              id="emotion-description"
              placeholder="You are feeling unsure. Take a deep breath and give yourself a moment."
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              className="min-h-[90px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emotion">Emotion keyword</Label>
              <Input
                id="emotion"
                placeholder="anxiety"
                value={form.emotion}
                onChange={(event) => setField("emotion", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insight">Insight</Label>
              <Input
                id="insight"
                placeholder="You are more resilient than you realize."
                value={form.insight}
                onChange={(event) => setField("insight", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="#8F7CF8"
                value={form.color}
                onChange={(event) => setField("color", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={form.priority}
                onChange={(event) => setField("priority", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Linked Question Tags</Label>
              <Input
                id="tags"
                placeholder="stress, fear, overthinking"
                value={form.linkedQuestionTags}
                onChange={(event) => setField("linkedQuestionTags", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emoji">Upload emoji image</Label>
              <Input
                id="emoji"
                type="file"
                accept="image/*"
                onChange={(event) => setField("emoji", event.target.files?.[0] || null)}
              />
              {emojiPreview ? (
                <Image
                  src={emojiPreview}
                  alt="Emoji preview"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-md border border-app-border object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachment">Upload attachment (PDF/Image)</Label>
              <Input
                id="attachment"
                type="file"
                onChange={(event) => setField("attachment", event.target.files?.[0] || null)}
              />
              <p className="text-xs text-app-muted">
                <UploadCloud className="mr-1 inline h-3 w-3" />
                Supported: PDF, JPG, PNG (up to 10MB)
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button onClick={handlePublish} fullWidth disabled={createMutation.isPending}>
              {createMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
            <Button variant="secondary" onClick={resetForm} type="button" fullWidth>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <section>
        {archetypesQuery.isLoading ? <CardsSkeleton count={6} /> : null}

        {!archetypesQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((item) => (
              <Card key={item._id}>
                <CardContent className="space-y-2 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.emoji?.url ? (
                        <Image
                          src={item.emoji.url}
                          alt={item.title}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-md object-cover"
                        />
                      ) : null}
                      <div>
                        <h3 className="font-semibold text-app-heading">{item.title}</h3>
                        <p className="text-xs uppercase tracking-wide text-app-muted">{item.emotion}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm("Delete this archetype?")) return;
                        deleteMutation.mutate(item._id);
                      }}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="line-clamp-3 text-sm text-app-body">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
