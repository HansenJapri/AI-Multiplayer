import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const UNKNOWN_ACCOUNT_EMAIL = "unknown account";

// Emails live in auth.users, which only the service role can read. Callers must first establish,
// through row level security, that the viewer may see this person.
export async function readAccountEmail(userId: string): Promise<string> {
  const { data } = await createSupabaseAdminClient().auth.admin.getUserById(userId);
  return data.user?.email ?? UNKNOWN_ACCOUNT_EMAIL;
}

export async function readAccountEmails(userIds: string[]): Promise<Map<string, string>> {
  const uniqueUserIds = [...new Set(userIds)];
  const emails = await Promise.all(uniqueUserIds.map(readAccountEmail));
  return new Map(
    uniqueUserIds.map((userId, index) => [userId, emails[index] ?? UNKNOWN_ACCOUNT_EMAIL]),
  );
}
