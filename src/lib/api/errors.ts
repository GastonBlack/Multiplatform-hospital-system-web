export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function parseApiError(status: number, body: unknown): ApiError {
  const fields: Record<string, string[]> = {};
  if (
    body &&
    typeof body === "object" &&
    "errors" in body &&
    body.errors &&
    typeof body.errors === "object"
  ) {
    for (const [name, value] of Object.entries(body.errors)) {
      if (
        Array.isArray(value) &&
        value.every((item) => typeof item === "string")
      ) {
        const key = name.charAt(0).toLowerCase() + name.slice(1);
        fields[key] = value;
      }
    }
  }
  const knownConflicts = [
    "Email is already registered.",
    "Identification number is already registered.",
    "Medical license number is already registered.",
  ];
  const conflict =
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string" &&
    knownConflicts.includes(body.message)
      ? body.message
      : "An account already exists with these details.";
  // Only known conflict messages may be exposed; other diagnostics remain private.
  const message = Object.keys(fields).length
    ? "Please check the highlighted fields."
    : status === 401
      ? "Your session or credentials are invalid. Please sign in again."
      : status === 403
        ? "You do not have permission to perform this action."
        : status === 409
          ? conflict
          : status >= 500
            ? "The service is unavailable. Please try again later."
            : "The request could not be completed. Please check your details.";
  return new ApiError(status, message, fields);
}
