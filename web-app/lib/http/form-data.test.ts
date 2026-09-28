// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFormText } from "./form-data";

describe("readFormText", () => {
  it("returns a text field", () => {
    const formData = new FormData();
    formData.set("email", "dev@agency.example");

    expect(readFormText(formData, "email")).toBe("dev@agency.example");
  });

  it("returns null for a missing field or an uploaded file", () => {
    const formData = new FormData();
    formData.set("upload", new Blob(["x"]));

    expect(readFormText(formData, "email")).toBeNull();
    expect(readFormText(formData, "upload")).toBeNull();
  });
});
