import { requireAdmin } from "@/lib/auth/guards.server";
import { EmployeeManagement } from "@/app/(admin)/components/employee-management";
import { loadDirectory } from "../directory.server";
import type { DirectorySearchParams } from "../directory-query";
export const metadata = { title: "Doctors" };
export default async function DoctorsPage({
  searchParams = Promise.resolve({}),
}: { searchParams?: Promise<DirectorySearchParams> } = {}) {
  const { token } = await requireAdmin();
  const directory = await loadDirectory("doctors", token, await searchParams);
  return <EmployeeManagement section="doctors" directory={directory} />;
}
