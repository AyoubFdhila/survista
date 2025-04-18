export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {children}
    </main>
  );
}

