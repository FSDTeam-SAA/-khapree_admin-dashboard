"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const buildPages = (page: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  return (
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center justify-end gap-2 rounded-lg bg-app-soft p-3",
        className,
      )}
    >
      <Button
        size="icon"
        variant="secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((item) => (
        <Button
          key={item}
          size="sm"
          variant={item === page ? "default" : "secondary"}
          onClick={() => onPageChange(item)}
          className="min-w-9"
        >
          {item}
        </Button>
      ))}

      <Button
        size="icon"
        variant="secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

