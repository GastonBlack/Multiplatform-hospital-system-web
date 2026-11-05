export function AdminSection({
  title,
}: {
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[#e7e9ee] bg-white p-7">
      <p className="text-[11px] font-semibold tracking-[0.1em] text-[#626a78]">
        ADMINISTRATION
      </p>
      <h1 className="text-[26px] leading-tight font-extrabold tracking-[-0.035em]">
        {title}
      </h1>
    </section>
  );
}
