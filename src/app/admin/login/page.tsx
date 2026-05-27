"use client";

import { useState } from "react";
import { login } from "@/lib/actions/index";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/hooks/useLocale";
import { loginSchema } from "@/lib/validations";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    const result = await login(data.username, data.password);

    if (!result.success) {
      let errorMessage = t("admin.invalidCredentials");

      if (result.error.startsWith("ACCOUNT_LOCKED:")) {
        const minutes = result.error.split(":")[1];
        errorMessage = t("admin.accountLocked").replace("{minutes}", minutes);
      } else if (result.error === "RATE_LIMIT_EXCEEDED") {
        errorMessage = t("admin.rateLimitExceeded");
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-center">
            {t("admin.login")}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            {t("admin.loginSubtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm">{t("admin.username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("admin.usernamePlaceholder")}
                {...register("username")}
                className="text-sm"
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">{t("admin.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("admin.passwordPlaceholder")}
                {...register("password")}
                className="text-sm"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <Button type="submit" className="w-full text-sm" disabled={isLoading}>
              {isLoading ? t("admin.signingIn") : t("admin.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}