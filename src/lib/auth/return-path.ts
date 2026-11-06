export function safeReturnPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/";
  const url = new URL(value, "https://mhs.local");
  if (
    url.origin !== "https://mhs.local" ||
    !["/", "/profile", "/admin", "/admin/doctors", "/admin/staff"].includes(
      url.pathname,
    )
  )
    return "/";
  return url.pathname + url.search;
}

export function renewalPath(returnTo: unknown) {
  return `/session/refresh?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`;
}
