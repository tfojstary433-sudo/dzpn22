"use client";

import { PageLoader } from '@/components/page-loader';
import { Suspense } from 'react';

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <PageLoader />
      {children}
    </Suspense>
  );
}
