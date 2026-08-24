import axios from "axios";

type ErrorBody = {
  message?: string;
  title?: string;
  errors?: Record<string, string[] | undefined>;
};

/** Converts API and connection failures into a message that is useful in a form. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ErrorBody>(error)) {
    return fallback;
  }

  if (!error.response) {
    return "Cannot reach the library server. Start the API and check its address.";
  }

  const body = error.response.data;
  const validationMessage = body?.errors
    ? Object.values(body.errors).flat().find(Boolean)
    : undefined;

  if (validationMessage) return validationMessage;
  if (body?.message) return body.message;
  if (body?.title) return body.title;
  if (error.response.status === 429) return "Too many attempts. Please wait a minute and try again.";

  return fallback;
}
