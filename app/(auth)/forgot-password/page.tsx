"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";
import { AuthShell } from "@/components/shared/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("OTP sent to your email");
      router.push(`/enter-otp?email=${encodeURIComponent(email)}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    forgotPasswordMutation.mutate({ email });
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your registered email and we will send you an OTP."
      className="border-none bg-transparent shadow-none"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-primary-soft" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pl-9"
              placeholder="Email"
            />
          </div>
        </div>

        <Button type="submit" fullWidth disabled={forgotPasswordMutation.isPending}>
          {forgotPasswordMutation.isPending ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </AuthShell>
  );
}

