import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({ title, subtitle, children, className }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className={cn("w-full max-w-[430px] border-app-border bg-app-surface", className)}>
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-fit rounded-xl border border-app-border bg-white p-1">
            <Image
              src="/brand-logo.png"
              alt="GeistGlow"
              width={70}
              height={70}
              className="rounded-lg object-cover"
            />
          </div>
          <CardTitle className="text-3xl font-semibold text-app-heading">{title}</CardTitle>
          {subtitle ? <p className="text-sm text-app-muted">{subtitle}</p> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

