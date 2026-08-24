import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./apiError";

describe("getApiErrorMessage", () => {
  it("explains when the API cannot be reached", () => {
    const error = new axios.AxiosError("Network Error");

    expect(getApiErrorMessage(error, "Fallback")).toContain("Cannot reach");
  });

  it("uses the API message when it is available", () => {
    const error = new axios.AxiosError(
      "Conflict",
      undefined,
      undefined,
      undefined,
      { data: { message: "This email is already registered." }, status: 409, statusText: "Conflict", headers: {}, config: { headers: new axios.AxiosHeaders() } }
    );

    expect(getApiErrorMessage(error, "Fallback")).toBe("This email is already registered.");
  });
});
