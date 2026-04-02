"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/shared/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (key: "email" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Login successful");
      router.push("/overview");
    } catch {
      toast.error("Unable to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Login To Your Account"
      subtitle="Please enter your email and password to continue"
      className="border-none bg-transparent shadow-none"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-primary-soft" />
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="pl-9"
              placeholder="Email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            leftIcon={Lock}
            placeholder="Password"
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-app-primary-soft hover:text-app-primary"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
}
