export function getErrorMessage(err: unknown, fallback = "An error occurred"): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: string }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}
