import Link from 'next/link';
import Head from 'next/head';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Server Error | Military Asset Management</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-9xl font-extrabold text-military-navy-dark">500</h1>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Server Error</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sorry, something went wrong on our server. Please try again later.
            </p>
          </div>
          <div className="mt-8">
            <Link href="/" className="btn btn-primary">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}