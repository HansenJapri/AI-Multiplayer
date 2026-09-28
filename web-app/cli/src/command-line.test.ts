// @vitest-environment node
import { describe, expect, it } from "vitest";
import { DEFAULT_API_URL, parseCommandLine } from "./command-line.js";

describe("parseCommandLine", () => {
  it("reads the command and uses the hosted app by default", () => {
    expect(parseCommandLine(["login"], {})).toEqual({
      command: "login",
      apiUrl: DEFAULT_API_URL,
      runId: null,
      step: null,
      launch: true,
    });
  });

  it("accepts --api and drops a trailing slash", () => {
    expect(parseCommandLine(["login", "--api", "http://localhost:3100/"], {}).apiUrl).toBe(
      "http://localhost:3100",
    );
  });

  it("uses AIM_API_URL when no --api flag is given", () => {
    expect(parseCommandLine(["status"], { AIM_API_URL: "http://localhost:3000" }).apiUrl).toBe(
      "http://localhost:3000",
    );
  });

  it("reads the run, the step and --no-launch for resume", () => {
    expect(parseCommandLine(["resume", "run-1", "--step", "3", "--no-launch"], {})).toMatchObject({
      command: "resume",
      runId: "run-1",
      step: 3,
      launch: false,
    });
  });

  it("shows help for resume without a run or with an invalid step", () => {
    expect(parseCommandLine(["resume"], {}).command).toBe("help");
    expect(parseCommandLine(["resume", "run-1", "--step", "0"], {}).command).toBe("help");
  });

  it("shows help for no command or an unknown one", () => {
    expect(parseCommandLine([], {}).command).toBe("help");
    expect(parseCommandLine(["deploy"], {}).command).toBe("help");
  });
});
