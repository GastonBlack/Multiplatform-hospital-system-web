import { SiteHeader } from "./components/site-header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main
        id="contenido"
        className="mx-auto w-[calc(100%-48px)] max-w-[1120px] max-[600px]:w-[calc(100%-32px)]"
      >
        {children}
      </main>
    </>
  );
}
