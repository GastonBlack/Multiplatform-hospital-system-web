import { requireAdmin } from "@/lib/auth/guards.server";
import { AdminSection } from "@/app/(admin)/components/admin-section";
export const metadata = { title: "Doctors" };
export default async function DoctorsPage() {
  await requireAdmin();
  return <AdminSection title="Doctors" />;
}
