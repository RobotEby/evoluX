import { apiFetch } from './client';

export type MeResponse = {
  userId: string;
  email: string | null;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    onboardingCompletedAt: string | null;
  } | null;
};

export function fetchMe(accessToken: string) {
  return apiFetch<MeResponse>('/me', { accessToken });
}
