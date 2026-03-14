import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useContestants() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["contestants"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContestantsWithVotes();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useCheckVote() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["checkVote"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.checkVote();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useVoteMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contestantId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.vote(contestantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestants"] });
      queryClient.invalidateQueries({ queryKey: ["checkVote"] });
    },
  });
}

// Admin credentials are validated client-side
// Default: admin / admin123
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export function useAdminLoginMutation() {
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      // Simulate async check
      await new Promise((r) => setTimeout(r, 400));
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Return a pseudo session token
        return { ok: `admin-session-${Date.now()}` };
      }
      return { err: "Invalid login ID or password." };
    },
  });
}

export function useAdminLogoutMutation() {
  return useMutation({
    mutationFn: async (_sessionId: string) => {
      // Client-side only logout
      await new Promise((r) => setTimeout(r, 200));
    },
  });
}

export function useAddContestantMutation(_sessionId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addContestant(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestants"] });
    },
  });
}

export function useSetContestantVideoMutation(_sessionId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contestantId,
      storageId,
    }: {
      contestantId: bigint;
      storageId: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.setContestantVideo(contestantId, storageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestants"] });
    },
  });
}

export function useRemoveContestantMutation(_sessionId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contestantId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.removeContestant(contestantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestants"] });
    },
  });
}

export function useSaveProfileMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
