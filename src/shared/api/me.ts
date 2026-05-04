import { api } from './client';

export type MeResponse = {
  userId: string;
  email: string | null;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    onboardingCompletedAt: string | null;
  } | null;
};

export function fetchMe() {
  return api.get<MeResponse>('/me');
}
