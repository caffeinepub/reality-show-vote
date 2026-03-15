import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useContestants() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["contestants"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContestantsWithVotes();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["isCallerAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCallerUserRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["callerUserRole", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
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

export function useAddContestantMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      videoFile,
      onProgress,
    }: {
      name: string;
      description: string;
      videoFile: File | null;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Actor not available");
      let externalBlob: ExternalBlob | null = null;
      if (videoFile) {
        const arrayBuffer = await videoFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        externalBlob = ExternalBlob.fromBytes(bytes);
        if (onProgress) {
          externalBlob = externalBlob.withUploadProgress(onProgress);
        }
      }
      return actor.addContestant(name, description, externalBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestants"] });
    },
  });
}

export function useRemoveContestantMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contestantId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.removeContestant(contestantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contestants"] });
    },
  });
}

export function useAssignAdminRoleMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      // Use claimFirstAdminRole — only works when no admin exists yet
      await actor.claimFirstAdminRole();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["callerUserRole"] });
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
