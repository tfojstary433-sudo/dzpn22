'use client';

import { useEffect } from 'react';

export function ClearStorageButton() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('clear') === 'true') {
        localStorage.clear();
        sessionStorage.clear();
        console.log('🧹 Wszystkie dane wyczyszczone!');
        window.location.href = '/';
      }
    }
  }, []);

  return null;
}
