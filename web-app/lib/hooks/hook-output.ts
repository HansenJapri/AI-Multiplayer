import type { MvpHookEventName } from "./hook-payload";

export interface HookDirective {
  hold: { raisedByEmail: string; reason: string } | null;
  steerMessages: { authorEmail: string; body: string }[];
}

export const EMPTY_DIRECTIVE: HookDirective = { hold: null, steerMessages: [] };

// Claude Code reads this JSON from a hook's stdout. An empty object means "continue".
export interface HookOutput {
  hookSpecificOutput?: {
    hookEventName: MvpHookEventName;
    permissionDecision?: "deny";
    permissionDecisionReason?: string;
    additionalContext?: string;
  };
}

function pausedReason(hold: NonNullable<HookDirective["hold"]>): string {
  const pausedBy = `paused by ${hold.raisedByEmail}`;
  return hold.reason === "" ? pausedBy : `${pausedBy}: ${hold.reason}`;
}

// Teammates' words are passed on unchanged; the app adds only who wrote them.
function steerContext(steerMessages: HookDirective["steerMessages"]): string {
  return steerMessages
    .map(({ authorEmail, body }) => `Message from teammate ${authorEmail}: ${body}`)
    .join("\n\n");
}

export function buildHookOutput(
  hookEventName: MvpHookEventName,
  directive: HookDirective,
): HookOutput {
  if (directive.hold !== null) {
    return {
      hookSpecificOutput: {
        hookEventName,
        permissionDecision: "deny",
        permissionDecisionReason: pausedReason(directive.hold),
      },
    };
  }
  if (directive.steerMessages.length > 0) {
    return {
      hookSpecificOutput: {
        hookEventName,
        additionalContext: steerContext(directive.steerMessages),
      },
    };
  }
  return {};
}
