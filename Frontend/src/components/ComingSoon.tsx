import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

function titleFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ComingSoon() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center lg:min-h-screen">
      <div className="flex h-16 w-16 items-center justify-center rounded-card bg-card text-camel shadow-sm ring-1 ring-line">
        <Construction className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
        {titleFromPath(pathname)}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This section is on the roadmap and will be available soon.
      </p>
    </div>
  );
}