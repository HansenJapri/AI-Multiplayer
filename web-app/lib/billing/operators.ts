// Operators run the service (for now: mark manual deposits paid). This is deployment config, not
// a workspace role: the product roles stay owner, driver and guest.
export function isOperatorEmail(email: string): boolean {
  const operatorEmails = (process.env.OPERATOR_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== "");
  return operatorEmails.includes(email.trim().toLowerCase());
}
