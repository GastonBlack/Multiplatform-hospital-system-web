/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation revalidates the session on every section change. */
import { requireAdmin } from "@/lib/auth/guards.server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="grid min-h-svh grid-cols-[220px_1fr] max-[600px]:grid-cols-1">
      <aside className="border-r border-[#e7e9ee] bg-[#fafbfc] p-7 max-[600px]:border-r-0 max-[600px]:border-b max-[600px]:p-5">
        <a
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.03em] text-[#17191d]"
          href="/"
        >
          + MHS
        </a>
        <p className="mt-6 mb-4 text-xs text-[#626a78]">Administration</p>
        <nav
          aria-label="Administration"
          className="flex flex-col flex-wrap items-start gap-6 text-[13px] text-[#4d5360] [&_a:hover]:text-[#163f73] [&_a:hover]:underline max-[600px]:flex-row max-[600px]:gap-4"
        >
          <a href="/admin">Dashboard</a>
          <a href="/admin/doctors">Doctors</a>
          <a href="/admin/staff">Staff</a>
          <a href="/profile">My profile</a>
          <a href="/">Back to site</a>
        </nav>
      </aside>
      <main id="contenido" className="p-8 max-[600px]:p-4">
        {children}
      </main>
    </div>
  );
}
