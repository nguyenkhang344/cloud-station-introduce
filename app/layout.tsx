import { Metadata } from 'next';
import LayoutClient from './layout-client';

export const metadata: Metadata = {
  title: {
    template: '%s | Web Developer Portfolio',
    default: 'Web Developer Portfolio',
  },
  description: 'An Interactive 3D Web Experience built to showcase advanced web development skills.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient>{children}</LayoutClient>;
}
