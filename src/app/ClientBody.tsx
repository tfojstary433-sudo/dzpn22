"use client";

import { LoadingScreen } from "@/components/loading-screen";
import { useTranslation } from "@/lib/i18n";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <>
      <LoadingScreen />
      {children}
    </>
  );
}
