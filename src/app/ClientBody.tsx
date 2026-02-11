"use client";

import { LoadingScreen } from "@/components/loading-screen";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingScreen />
      {children}
    </>
  );
}
