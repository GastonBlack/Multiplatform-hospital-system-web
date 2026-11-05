import { requireAdmin } from "@/lib/auth/guards.server";
import { AdminSection } from "@/app/(admin)/components/admin-section";
export const metadata = { title: "Administration" };
export default async function AdminPage() {
  await requireAdmin();
  return <AdminSection title="Dashboard" />;
}
