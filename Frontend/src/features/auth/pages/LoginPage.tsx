import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, type LoginFormValues } from "@/lib/validation/authSchemas";
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
     setAccessToken(data.token);
      navigate("/books");
    },
    onError: () => {
      setServerError("Invalid email or password.");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setServerError(null);
    mutation.mutate(values);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1ea] px-4">

      {/* Background decoration */}
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#c8a96b]/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#1f2937]/10 blur-3xl" />

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-500">

        <Card className="overflow-hidden border-[#ded8cc] bg-white shadow-[0_20px_60px_-20px_rgba(31,41,55,0.25)]">

          {/* Top accent */}
          <div className="h-1 bg-[#b08a45]" />

          <CardHeader className="pb-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f2937] text-[#f4f1ea]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  <path d="M8 7h8M8 11h6" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a773c]">
                  Library
                </p>
                <p className="text-xs text-muted-foreground">
                  Management System
                </p>
              </div>
            </div>

            <CardTitle className="text-3xl font-semibold tracking-tight text-[#1f2937]">
              Welcome back
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue to your account.
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-[#374151]"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 border-[#d8d3c8] bg-[#faf9f6] transition-all duration-200 placeholder:text-[#aaa59c] focus:border-[#b08a45] focus:ring-[#b08a45]/20"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[#374151]"
                >
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 border-[#d8d3c8] bg-[#faf9f6] transition-all duration-200 placeholder:text-[#aaa59c] focus:border-[#b08a45] focus:ring-[#b08a45]/20"
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-600">
                    {serverError}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="h-11 w-full bg-[#1f2937] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#111827] hover:shadow-lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Signing in..." : "Sign in"}
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-[#ded8cc]" />
                <p className="text-sm text-muted-foreground">
                  Don't have an account?
                </p>
                <div className="h-px w-10 bg-[#ded8cc]" />
              </div>

              <Link
                to="/register"
                className="group text-sm font-medium text-[#9a773c] transition-colors duration-200 hover:text-[#735729]"
              >
                Create an account
                <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs text-[#8f8a80]">
          Your books, records, and library — all in one place.
        </p>
      </div>
    </div>
  );
}