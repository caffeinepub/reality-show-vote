import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type ContestantId = bigint;
export interface Contestant {
    id: ContestantId;
    name: string;
    createdAt: Time;
    description: string;
    videoUrl?: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContestant(name: string, description: string, externalBlob: ExternalBlob | null): Promise<ContestantId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimFirstAdminRole(): Promise<void>;
    checkVote(): Promise<ContestantId | null>;
    getAllContestants(): Promise<Array<Contestant>>;
    getAllContestantsWithVotes(): Promise<Array<[Contestant, bigint]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContestant(contestantId: ContestantId): Promise<Contestant | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeContestant(contestantId: ContestantId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateContestant(contestantId: ContestantId, name: string, description: string, externalBlob: ExternalBlob | null): Promise<void>;
    vote(contestantId: ContestantId): Promise<void>;
}
