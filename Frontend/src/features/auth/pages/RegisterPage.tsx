import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validation/authSchemas";
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { roleId: 1 },
  });

  const selectedRole = watch("roleId");

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate("/login", { state: { registered: true } });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message ?? "Registration failed. Please try again.";

      setServerError(message);
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    mutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      roleId: values.roleId,
      facultyPassword: values.facultyPassword || undefined,
    });
  };

  return (
    <div className="page-ambient relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-camel/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-ink/[0.06] blur-3xl" />

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="overflow-hidden border-line bg-card shadow-[0_24px_70px_-24px_rgba(17,17,17,0.3)]">
          <div className="h-1.5 bg-gradient-to-r from-camel via-camel-dark to-camel/40" />

          <CardHeader className="pb-5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-camel to-camel-dark text-ink shadow-pill ring-1 ring-black/5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  <path d="M8 7h8M8 11h6" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-camel-dark">
                  Libro Library
                </p>
                <p className="text-xs text-muted">Management System</p>
              </div>
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight text-ink">
              Create your account
            </CardTitle>

            <p className="mt-1.5 text-sm text-muted">
              Join the library and start managing your collection.
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-ink">I am registering as a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard
                    active={selectedRole === 1}
                    title="Student"
                    description="Standard library member"
                    onClick={() => setValue("roleId", 1, { shouldValidate: true })}
                  />
                  <RoleCard
                    active={selectedRole === 2}
                    title="Faculty"
                    description="Faculty library member"
                    onClick={() => setValue("roleId", 2, { shouldValidate: true })}
                  />
                </div>
              </div>

              {selectedRole === 2 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                  <Label
                    htmlFor="facultyPassword"
                    className="text-sm font-medium text-ink"
                  >
                    Faculty registration password
                  </Label>

                  <Input
                    id="facultyPassword"
                    type="password"
                    placeholder="Enter faculty password"
                    className="h-11 border-line bg-card placeholder:text-muted"
                    {...register("facultyPassword")}
                  />

                  {errors.facultyPassword && (
                    <p className="text-sm text-destructive">
                      {errors.facultyPassword.message}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-ink"
                  >
                    First name
                  </Label>

                  <Input
                    id="firstName"
                    placeholder="John"
                    className="h-11 border-line bg-card placeholder:text-muted"
                    {...register("firstName")}
                  />

                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-ink"
                  >
                    Last name
                  </Label>

                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="h-11 border-line bg-card placeholder:text-muted"
                    {...register("lastName")}
                  />

                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-ink"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 border-line bg-card placeholder:text-muted"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-ink"
                >
                  Phone
                  <span className="ml-1 text-xs font-normal text-muted">
                    (optional)
                  </span>
                </Label>

                <Input
                  id="phone"
                  placeholder="98XXXXXXXX"
                  className="h-11 border-line bg-card placeholder:text-muted"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-ink"
                >
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="h-11 border-line bg-card placeholder:text-muted"
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-ink"
                >
                  Confirm password
                </Label>

                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  className="h-11 border-line bg-card placeholder:text-muted"
                  {...register("confirmPassword")}
                />

                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-600">
                    {serverError}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-5">
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>

              <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-line" />

                <p className="text-sm text-muted">
                  Already have an account?
                </p>

                <div className="h-px flex-1 bg-line" />
              </div>

              <Link
                to="/login"
                className="group text-sm font-medium text-camel transition-colors duration-200 hover:text-camel-dark"
              >
                Sign in
                <span className="ml-1 inline-block transition-transform duration-200 group-hover:-translate-x-1">
                  ←
                </span>
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

function RoleCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-soft border px-3.5 py-3 text-left transition-all duration-200 ${
        active
          ? "border-camel bg-gradient-to-br from-camel/15 to-camel/5 shadow-sm ring-2 ring-camel/25"
          : "border-line bg-card hover:-translate-y-0.5 hover:border-camel/60 hover:shadow-sm"
      }`}
    >
      <p className={`text-sm font-bold ${active ? "text-camel-dark" : "text-ink"}`}>{title}</p>
      <p className="mt-0.5 text-xs text-muted">{description}</p>
    </button>
  );
}