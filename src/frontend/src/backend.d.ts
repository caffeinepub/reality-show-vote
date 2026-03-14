import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Contestant {
    id: ContestantId;
    name: string;
    createdAt: bigint;
    videoAssetId?: string;
    description: string;
}
export type ContestantId = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export type AdminLoginResult = { ok: string } | { err: string };
export type ChangeCredentialsResult = { ok: null } | { err: string };
export interface backendInterface {
    // Session-based admin auth
    initAdminCredentials(username: string, password: string): Promise<boolean>;
    adminLogin(username: string, password: string): Promise<AdminLoginResult>;
    adminLogout(sessionId: string): Promise<void>;
    verifyAdminSession(sessionId: string): Promise<boolean>;
    changeAdminCredentials(sessionId: string, newUsername: string, newPassword: string): Promise<ChangeCredentialsResult>;
    // Admin contestant management (session-based)
    addContestant(sessionId: string, name: string, description: string): Promise<ContestantId>;
    removeContestant(sessionId: string, contestantId: ContestantId): Promise<void>;
    setContestantVideo(sessionId: string, contestantId: ContestantId, storageId: string): Promise<void>;
    // User (II-based)
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkVote(): Promise<ContestantId | null>;
    getAllContestantsWithVotes(): Promise<Array<[Contestant, bigint]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContestant(contestantId: ContestantId): Promise<Contestant | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    vote(contestantId: ContestantId): Promise<void>;
}
