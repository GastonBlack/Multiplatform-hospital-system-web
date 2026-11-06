"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Stethoscope, UsersRound } from "lucide-react";

const sections = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/staff", label: "Staff", icon: UsersRound },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="flex flex-col gap-1 pr-2">
      {sections.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`group relative flex h-12 items-center gap-3 rounded-r-md pl-5 pr-3 text-left text-sm outline-offset-4 transition-all duration-150 motion-reduce:translate-x-0 motion-reduce:scale-100! motion-reduce:transition-none! focus-visible:outline-2 focus-visible:outline-[#142375] ${active ? "translate-x-1.5 scale-[1.025]! bg-[#eef1fb] font-semibold text-[#142375]" : "scale-100! text-[#626a78] hover:translate-x-1 hover:bg-[#f5f6fa] hover:text-[#242424]"}`}
          >
            <span aria-hidden="true" className={`absolute left-0 top-1/2 w-0.5 -translate-y-1/2 rounded-full transition-all duration-150 motion-reduce:transition-none ${active ? "h-6 bg-[#142375]" : "h-4 bg-[#242424] group-hover:h-5 group-hover:bg-[#142375]"}`} />
            <Icon aria-hidden="true" size={17} strokeWidth={1.7} className="shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
