import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageBanner({
  message,
  className,
}: {
  message: { text: string; kind: "success" | "error" } | null;
  className?: string;
}) {
  if (!message) return null;

  const Icon = message.kind === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      role="status"
      className={cn(
        "mb-4 flex items-center gap-2.5 rounded-card border px-4 py-2.5 text-sm",
        message.kind === "error"
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {message.text}
    </div>
  );
}