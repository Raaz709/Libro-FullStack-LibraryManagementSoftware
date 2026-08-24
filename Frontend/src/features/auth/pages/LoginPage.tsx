import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { roleHomePath } from "@/components/layout/navConfig";
import { loginSchema, type LoginFormValues } from "@/lib/validation/authSchemas";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAccessToken(data.token, {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      navigate(roleHomePath(useAuthStore.getState().user?.role), { replace: true });
    },
    onError: (error) => {
      setServerError(getApiErrorMessage(error, "Invalid email or password."));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setServerError(null);
    mutation.mutate(values);
  };

  return (
    <div className="page-ambient relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-camel/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-ink/[0.06] blur-3xl" />

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="overflow-hidden border-line bg-card shadow-[0_24px_70px_-24px_rgba(17,17,17,0.3)]">
          <div className="h-1.5 bg-gradient-to-r from-camel via-camel-dark to-camel/40" />

          <CardHeader className="pb-5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-camel to-camel-dark text-ink shadow-pill ring-1 ring-black/5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  <path d="M8 7h8M8 11h6" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-camel-dark">Libro Library</p>
                <p className="text-xs text-muted">Management System</p>
              </div>
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight text-ink">
              Welcome back
            </CardTitle>
            <p className="mt-1.5 text-sm text-muted">Sign in to continue to your account.</p>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-ink">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 border-line bg-card placeholder:text-muted"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-ink">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 border-line bg-card placeholder:text-muted"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              {serverError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Signing in..." : "Sign in"}
              </Button>

              <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <p className="text-sm text-muted">Don't have an account?</p>
                <div className="h-px flex-1 bg-line" />
              </div>

              <Link
                to="/register"
                className="group text-sm font-medium text-camel transition-colors duration-200 hover:text-camel-dark"
              >
                Create an account
                <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs text-muted">
          Your books, records, and library — all in one place.
        </p>
      </div>
    </div>
  );
}
