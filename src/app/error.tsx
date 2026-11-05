"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section
      className="mx-auto my-8 max-w-[600px] rounded-xl border border-[#e7e9ee] bg-white p-7"
      role="alert"
    >
      <h1 className="text-[26px] leading-tight font-extrabold tracking-[-0.035em]">
        Unable to load this page
      </h1>
      <p className="mt-3 text-[#626a78]">
        Unable to connect to the service. Please try again later.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[7px] border border-[#163f73] bg-[#163f73] px-[18px] py-[9px] font-bold text-white transition-colors hover:bg-[#10325b]"
          onClick={reset}
        >
          Try again
        </button>
        <Link
          className="text-[#163f73] underline-offset-4 hover:underline"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
