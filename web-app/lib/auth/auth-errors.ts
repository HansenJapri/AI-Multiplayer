const HTTP_TOO_MANY_REQUESTS = 429;

// The subset of Supabase's AuthError the forms need; avoids logging or showing its message.
export interface AuthErrorLike {
  status?: number;
  code?: string;
}

export function isRateLimited(error: AuthErrorLike): boolean {
  return error.status === HTTP_TOO_MANY_REQUESTS;
}
