"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { CardsSkeleton } from "@/components/shared/loading-blocks";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createQuiz,
  createQuizzesBulk,
  getArchetypes,
  getQuizzes,
  queryKeys,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";
import { cn, formatDate } from "@/lib/utils";
import type { Archetype } from "@/types/api";

type QuizFormQuestion = {
  question: string;
  options: string[];
};

const PAGE_SIZE = 6;

const createEmptyQuestion = (): QuizFormQuestion => ({
  question: "",
  options: ["", "", "", ""],
});

type HighlightCardProps = {
  item: Archetype;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

function HighlightCard({ item, active, compact, onClick }: HighlightCardProps) {
  const cardContent = (
    <div
      className={cn(
        "rounded-lg border border-app-border bg-[#7d8fb7] p-2.5 transition-colors",
        active ? "bg-gradient-to-r from-[#5236bf] to-[#8a57ff]" : "hover:bg-[#8799be]",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#123f85]">
          {item.emoji?.url ? (
            <Image src={item.emoji.url} alt={item.title} fill className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 text-white">
          <p className="truncate text-lg font-semibold">{item.title}</p>
          <p className="line-clamp-2 text-xs text-white/85">{item.description}</p>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return <div className="w-full">{cardContent}</div>;
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {cardContent}
    </button>
  );
}

export default function QuizOrganizerPage() {
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<QuizFormQuestion[]>([createEmptyQuestion()]);
  const [highlightId, setHighlightId] = useState("");
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);
  const [page, setPage] = useState(1);

  const quizzesQuery = useQuery({
    queryKey: queryKeys.quizzes,
    queryFn: getQuizzes,
  });

  const archetypesQuery = useQuery({
    queryKey: queryKeys.archetypes,
    queryFn: getArchetypes,
  });

  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      toast.success("Quiz created successfully");
      setQuestions([createEmptyQuestion()]);
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const bulkMutation = useMutation({
    mutationFn: () => createQuizzesBulk({ count: 40 }),
    onSuccess: (data) => {
      toast.success(`${data.count} quizzes generated`);
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const quizzes = quizzesQuery.data;
  const totalPages = Math.max(1, Math.ceil((quizzes?.length || 0) / PAGE_SIZE));
  const paginatedQuizzes = useMemo(
    () => (quizzes ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, quizzes],
  );

  const highlights = archetypesQuery.data ?? [];
  const selectedHighlight =
    highlights.find((item) => item._id === highlightId) || highlights[0] || null;

  const setQuestionField = (index: number, value: string) => {
    setQuestions((prev) => {
      const cloned = [...prev];
      cloned[index] = { ...cloned[index], question: value };
      return cloned;
    });
  };

  const setOptionField = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) => {
      const cloned = [...prev];
      const question = { ...cloned[questionIndex] };
      const options = [...question.options];
      options[optionIndex] = value;
      question.options = options;
      cloned[questionIndex] = question;
      return cloned;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const resetForm = () => {
    setQuestions([createEmptyQuestion()]);
    setHighlightId("");
    setIsHighlightsOpen(false);
  };

  const handleSubmit = () => {
    const normalizedQuestions = questions
      .map((question, questionIndex) => ({
        question: question.question.trim(),
        options: question.options.map((option, optionIndex) => ({
          label: String(optionIndex + 1),
          text: option.trim(),
        })),
        order: questionIndex + 1,
      }))
      .filter((question) => question.question.length > 0);

    if (!normalizedQuestions.length) {
      toast.error("At least one question is required");
      return;
    }

    const hasInvalid = normalizedQuestions.some((question) =>
      question.options.some((option) => !option.text),
    );
    if (hasInvalid) {
      toast.error("Each question must include all 4 options");
      return;
    }

    createQuizMutation.mutate({ questions: normalizedQuestions });
  };

  return (
    <div className="">
      <div className="space-y-5">
        <PageHeader
          title="Create New Quizzes"
          subtitle="Create admin quiz questions and manage existing sets"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="gap-2" onClick={() => bulkMutation.mutate()}>
                <PlusCircle className="h-4 w-4" />
                Generate 40
              </Button>
              <Button className="gap-2" onClick={addQuestion}>
                <PlusCircle className="h-4 w-4" />
                Add New
              </Button>
            </div>
          }
        />

        <Card>
          <CardContent className="space-y-5 pt-6">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-3 rounded-md border border-app-border p-4">
                <div className="space-y-2">
                  <Label>Questions</Label>
                  <Input
                    placeholder="What motivates you most in life?"
                    value={question.question}
                    onChange={(event) => setQuestionField(questionIndex, event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option input</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <Input
                        key={optionIndex}
                        placeholder={`${optionIndex + 1}. Option`}
                        value={option}
                        onChange={(event) =>
                          setOptionField(questionIndex, optionIndex, event.target.value)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label>Today&apos;s highlights</Label>
              <div className="rounded-md border border-app-border bg-white p-3">
                <button
                  type="button"
                  onClick={() => setIsHighlightsOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-3"
                >
                  <div className="w-full max-w-[360px]">
                    {selectedHighlight ? (
                      <HighlightCard item={selectedHighlight} active compact />
                    ) : (
                      <div className="rounded-md border border-dashed border-app-border p-4 text-left text-sm text-app-muted">
                        No highlight selected
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-app-primary transition-transform",
                      isHighlightsOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>

                {isHighlightsOpen ? (
                  <div className="mt-3 space-y-2">
                    {highlights.map((item) => (
                      <HighlightCard
                        key={item._id}
                        item={item}
                        active={selectedHighlight?._id === item._id}
                        onClick={() => {
                          setHighlightId(item._id);
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Button onClick={handleSubmit} disabled={createQuizMutation.isPending} fullWidth>
                {createQuizMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
              <Button variant="secondary" onClick={resetForm} type="button" fullWidth>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <section>
          <CardHeader className="px-0 pb-3">
            <CardTitle>Existing Quizzes</CardTitle>
          </CardHeader>

          {quizzesQuery.isLoading ? <CardsSkeleton count={4} /> : null}

          {!quizzesQuery.isLoading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {paginatedQuizzes.map((quiz) => (
                <Card key={quiz._id}>
                  <CardContent className="space-y-2 pt-5">
                    <p className="text-sm text-app-muted">Quiz ID: {quiz._id.slice(-6)}</p>
                    <h3 className="text-base font-semibold text-app-heading">
                      {quiz.questions[0]?.question || "Untitled Quiz"}
                    </h3>
                    <p className="text-sm text-app-body">{quiz.questions.length} questions</p>
                    <p className="text-xs text-app-muted">Created: {formatDate(quiz.createdAt)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>
    </div>
  );
}
