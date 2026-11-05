import Link from "next/link";
export default function NotFound() {
  return (
    <main
      id="contenido"
      className="mx-auto w-[calc(100%-48px)] max-w-[1120px] py-8 text-[#626a78] max-[600px]:w-[calc(100%-32px)]"
    >
      <h1 className="text-[26px] leading-tight font-extrabold tracking-[-0.035em]">
        Page not found
      </h1>
      <Link
        className="text-[#163f73] underline-offset-4 hover:underline"
        href="/"
      >
        Back to home
      </Link>
    </main>
  );
}
