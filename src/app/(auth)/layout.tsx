export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-[#ffffff]">
      <main>{children}</main>
    </div>
  );
}
