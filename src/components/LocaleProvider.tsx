"use client";

import React from "react";
import { LocaleProvider } from "@/hooks/useLocale";

export default function ClientLocaleProvider({
  children,
  includeAdmin = false,
}: {
  children: React.ReactNode;
  includeAdmin?: boolean;
}) {
  return <LocaleProvider includeAdmin={includeAdmin}>{children}</LocaleProvider>;
}
