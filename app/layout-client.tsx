'use client';

import '@/app/ui/global.css';
import { SoundProvider } from '@/app/lib/contexts/SoundContext';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const RouteAwareMusic = dynamic(() => import('@/app/ui/common/RouteAwareMusic'), {
  ssr: false,
  loading: () => null,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SoundProvider>
          <Suspense fallback={null}>
            <RouteAwareMusic />
          </Suspense>
          {children}
        </SoundProvider>
      </body>
    </html>
  );
}
