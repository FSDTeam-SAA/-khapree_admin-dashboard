"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputProps, "type"> & {
  leftIcon?: LucideIcon;
};

export function PasswordInput({
  className,
  leftIcon: LeftIcon,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {LeftIcon ? (
        <LeftIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-primary-soft" />
      ) : null}
      <Input
        type={showPassword ? "text" : "password"}
        className={cn(LeftIcon ? "pl-9" : "", "pr-10", className)}
        {...props}
      />
      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-app-muted hover:bg-slate-100 hover:text-app-heading"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

