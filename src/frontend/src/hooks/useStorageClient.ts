import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStorageClient() {
  const { identity } = useInternetIdentity();

  const uploadFile = async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> => {
    const config = await loadConfig();
    const agent = new HttpAgent({
      identity: identity || undefined,
      host: config.backend_host,
    });
    if (config.backend_host?.includes("localhost")) {
      await agent.fetchRootKey().catch(console.warn);
    }
    const storageClient = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { hash } = await storageClient.putFile(bytes, onProgress);
    return hash;
  };

  const getVideoUrl = async (storageId: string): Promise<string> => {
    const config = await loadConfig();
    const agent = new HttpAgent({ host: config.backend_host });
    const storageClient = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    return storageClient.getDirectURL(storageId);
  };

  return { uploadFile, getVideoUrl };
}
