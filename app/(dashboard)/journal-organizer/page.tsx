"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { CardsSkeleton } from "@/components/shared/loading-blocks";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJournalPrompt, getJournalPrompts, queryKeys } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";

const PAGE_SIZE = 6;

type JournalFormState = {
  moodQuestion: string;
  emotion: string;
  questions: string[];
  tips: string[];
};

const defaultState: JournalFormState = {
  moodQuestion: "How are you feeling?",
  emotion: "",
  questions: [""],
  tips: [""],
};

export default function JournalOrganizerPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<JournalFormState>(defaultState);
  const [page, setPage] = useState(1);

  const promptsQuery = useQuery({
    queryKey: queryKeys.journalPrompts,
    queryFn: getJournalPrompts,
  });

  const createMutation = useMutation({
    mutationFn: createJournalPrompt,
    onSuccess: () => {
      toast.success("Journal prompt created");
      setForm(defaultState);
      queryClient.invalidateQueries({ queryKey: queryKeys.journalPrompts });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const prompts = promptsQuery.data;
  const totalPages = Math.max(1, Math.ceil((prompts?.length || 0) / PAGE_SIZE));
  const paginated = useMemo(
    () => (prompts ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, prompts],
  );

  const updateQuestion = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.questions];
      updated[index] = value;
      return { ...prev, questions: updated };
    });
  };

  const updateTip = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.tips];
      updated[index] = value;
      return { ...prev, tips: updated };
    });
  };

  const handleSubmit = () => {
    const questions = form.questions.map((item) => item.trim()).filter(Boolean);
    const tips = form.tips.map((item) => item.trim()).filter(Boolean);

    if (!form.emotion.trim()) {
      toast.error("Emotion is required");
      return;
    }
    if (!questions.length || !tips.length) {
      toast.error("At least one question and one tip are required");
      return;
    }

    createMutation.mutate({
      moodQuestion: form.moodQuestion.trim(),
      emotion: form.emotion.trim(),
      questions,
      tips,
    });
  };

  return (
    <div className="fade-up space-y-5">
      <PageHeader
        title="Create New Journal"
        subtitle="Create daily journal templates based on emotion"
        actions={
          <Button
            className="gap-2"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                questions: [...prev.questions, ""],
                tips: [...prev.tips, ""],
              }))
            }
          >
            <PlusCircle className="h-4 w-4" />
            Add New
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="emotion">How are you feeling?</Label>
            <Input
              id="emotion"
              placeholder="Angry"
              value={form.emotion}
              onChange={(event) => setForm((prev) => ({ ...prev, emotion: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood-question">Mood Question</Label>
            <Input
              id="mood-question"
              placeholder="How are you feeling?"
              value={form.moodQuestion}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, moodQuestion: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Questions</Label>
            {form.questions.map((question, index) => (
              <Input
                key={index}
                placeholder={`Question ${index + 1}`}
                value={question}
                onChange={(event) => updateQuestion(index, event.target.value)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <Label>Journaling Tips</Label>
            {form.tips.map((tip, index) => (
              <Textarea
                key={index}
                className="min-h-[80px]"
                placeholder={`Tip ${index + 1}`}
                value={tip}
                onChange={(event) => updateTip(index, event.target.value)}
              />
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button onClick={handleSubmit} fullWidth disabled={createMutation.isPending}>
              {createMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setForm(defaultState)}
              type="button"
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <section>
        {promptsQuery.isLoading ? <CardsSkeleton count={6} /> : null}

        {!promptsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((prompt) => (
              <Card key={prompt._id}>
                <CardContent className="space-y-3 pt-5">
                  <div>
                    <h3 className="text-lg font-semibold text-app-heading">{prompt.title}</h3>
                    <p className="text-sm uppercase text-app-muted">{prompt.emotion}</p>
                  </div>
                  <p className="text-sm text-app-body">{prompt.moodQuestion}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-app-heading">Questions</p>
                    <ul className="space-y-1 text-xs text-app-muted">
                      {prompt.promptQuestions.slice(0, 3).map((question) => (
                        <li key={question}>- {question}</li>
                      ))}
                    </ul>
                  </div>
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
