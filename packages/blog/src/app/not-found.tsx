import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="container-blog py-24 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. 
        It might have been moved or deleted.
      </p>
      <Link href="/" className="btn-primary">
        Back to Blog
      </Link>
    </div>
  );
}
