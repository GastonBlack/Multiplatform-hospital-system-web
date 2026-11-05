import { requireAdmin } from "@/lib/auth/guards.server";
import { AdminSection } from "@/app/(admin)/components/admin-section";
export const metadata = { title: "Staff" };
export default async function StaffPage() {
  await requireAdmin();
  return <AdminSection title="Staff" />;
}
