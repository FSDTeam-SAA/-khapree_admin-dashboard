"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthShell } from "@/components/shared/auth-shell";
import { Button } from "@/components/ui/button";
import { forgotPassword, verifyOtp } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/axios";

const OTP_LENGTH = 6;

function EnterOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      const joinedOtp = otp.join("");
      toast.success("OTP verified successfully");
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(joinedOtp)}`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("OTP resent");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const joinedOtp = otp.join("");
    if (joinedOtp.length !== OTP_LENGTH) {
      toast.error("Please enter the full 6 digit OTP");
      return;
    }

    if (!email) {
      toast.error("Email is missing. Please start again from forgot password page.");
      return;
    }

    verifyOtpMutation.mutate({ email, otp: joinedOtp });
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Email is missing. Please start again.");
      return;
    }
    resendMutation.mutate({ email });
  };

  return (
    <AuthShell title="Enter OTP" subtitle={`OTP sent to ${email || "your email"}`}>
      <div className="space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((value, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={value}
              onChange={(event) => handleOtpChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-md border border-app-border bg-white text-center text-2xl font-semibold text-app-heading focus:outline-none focus:ring-2 focus:ring-app-primary/40 md:h-16 md:w-14"
            />
          ))}
        </div>

        <p className="text-center text-sm text-app-body">
          Didn&apos;t receive OTP?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendMutation.isPending}
            className="font-semibold text-app-primary-soft hover:text-app-primary disabled:opacity-50"
          >
            RESEND OTP
          </button>
        </p>

        <Button
          fullWidth
          onClick={handleVerify}
          disabled={verifyOtpMutation.isPending || resendMutation.isPending}
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
        </Button>
      </div>
    </AuthShell>
  );
}

export default function EnterOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-surface" />}>
      <EnterOtpContent />
    </Suspense>
  );
}
