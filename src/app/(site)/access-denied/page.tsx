import Link from "next/link";

export const metadata = { title: "Access denied" };

export default function AccessDeniedPage() {
  return (
    <section className="mx-auto my-10 flex max-w-[600px] flex-col gap-4 rounded-sm border border-[#e7e9ee] bg-white p-7">
      <h1 className="text-[26px] font-extrabold text-[#242424]">Access denied</h1>
      <p>You do not have permission to access this area.</p>
      <Link href="/perfil" className="font-semibold text-[#142375]">Back to profile</Link>
    </section>
  );
}
