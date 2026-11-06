/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation revalidates the session on every section change. */
import { requireAdmin } from "@/lib/auth/guards.server";
import { Hospital, LogOut } from "lucide-react";
import { AdminNavigation } from "../components/admin-navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="grid min-h-svh grid-cols-[244px_minmax(0,1fr)] max-[600px]:grid-cols-1">
      <aside className="flex flex-col border-r border-[#e6e9f0] bg-white px-6 py-8 max-[600px]:border-r-0 max-[600px]:border-b max-[600px]:p-5">
        <a
          className="inline-flex w-fit flex-col items-center gap-1"
          href="/"
          aria-label="MHS home"
        >
          <Hospital aria-hidden="true" className="size-12 fill-[#142375] text-white" />
          <span className="text-sm font-extrabold tracking-wide text-[#242424]">MHS</span>
        </a>
        <div className="mt-10">
          <AdminNavigation />
        </div>
        <div className="mt-auto pt-10">
          <a href="/" className="inline-flex min-h-10 items-center gap-3 pl-5 text-xs font-medium text-[#626a78] hover:text-[#142375]">
            <LogOut aria-hidden="true" size={16} strokeWidth={1.7} /> Back to site
          </a>
        </div>
      </aside>
      <main id="contenido" className="p-8 max-[600px]:p-4">
        {children}
      </main>
    </div>
  );
}
