import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Welcome to Survista!</h1>
      <div className="space-x-4">
        <Link href="/auth/login" className="text-blue-700 hover:underline dark:text-blue-400">
          Sign In
        </Link>
        <Link href="/auth/signup" className="text-blue-700 hover:underline dark:text-blue-400">
          Sign Up
        </Link>
      </div>
    </main>
  );
}
