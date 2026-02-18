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
      <div className="bg-red-600 text-white text-center py-2 px-4 font-black uppercase tracking-widest text-xs sticky top-0 z-[200] flex items-center justify-center gap-2 leading-none">
        <img src="https://i.ibb.co/pBJgbXxn/image.png" alt="PFF" className="h-4 w-auto brightness-0 invert relative -top-[2px]" />
        {t('shop.maintenance_banner')}
      </div>
      <LoadingScreen />
      {children}
    </>
  );
}
