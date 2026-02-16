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
      <div className="bg-red-600 text-white text-center py-2 px-4 font-black uppercase tracking-widest text-xs sticky top-0 z-[200]">
        {t('shop.maintenance_banner')}
      </div>
      <LoadingScreen />
      {children}
    </>
  );
}
