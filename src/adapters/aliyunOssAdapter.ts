import { 
  ObjectStorageAdapter,
  Folder,
  ObjectMeta,
  Object,
} from "@/FileBrowser";
import { trpcClient } from "../utils/trpc";

export const createAliyunOssAdapter = (): ObjectStorageAdapter => ({
  async ls(args: { prefix: string; }): Promise<{ 
    objects: Object[];
    folders: Folder[];
    isTruncated: boolean; 
    count: number; 
  }> {
    const prefix = args.prefix.startsWith('/') ? args.prefix.slice(1) : args.prefix;
    const result = await trpcClient.aliyunOss.listObjects.query({
      prefix,
    });
    return result;
  },
  async upload(args: Parameters<ObjectStorageAdapter['upload']>[0]): Promise<string> {
    const { key, file, onProgress, onReady } = args;
    try {
      await trpcClient.aliyunOss.objectMeta.query({
        key,
      });
      return Promise.reject(new Error('Upload failed. A file with this name already exists.'));
    } catch (err) {
      // Normal flow
    }
    const signData = await trpcClient.aliyunOss.postObjectData.query({
      key: key,
      contentType: file.type.length > 0 ? file.type : undefined,
      filesize: file.size,
    });
    const formData = new FormData();
    formData.set('key', signData.key);
    formData.set('policy', signData.policyBase64);
    formData.set('OSSAccessKeyId', signData.accessKeyId);
    formData.set('signature', signData.signature);
    formData.set('file', file);
    formData.set('success_action_status', signData.successActionsStatus);
    const uri = `/${signData.bucket}/${signData.key}`;
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', signData.endpoint);
      xhr.addEventListener('load', () => {
        resolve(uri);
      });
      if (onProgress) {
        xhr.upload.addEventListener('progress', onProgress as EventListener);
      }
      if (onReady) {
        onReady(xhr);
      }
      xhr.send(formData);
    });
  },
  async mkdir(args: { key: string; }): Promise<void> {
    await trpcClient.aliyunOss.createFolder.mutate(args);
  },
  async rename(args: { source: string; destination: string; }): Promise<void> {
    await trpcClient.aliyunOss.rename.mutate(args);
  },
  async imagePreviewUrl(args: Parameters<ObjectStorageAdapter['imagePreviewUrl']>[0]) {
    return trpcClient.aliyunOss.imagePreviewUrl.query(args);
  },
  async objectUrl(args: Parameters<ObjectStorageAdapter['objectUrl']>[0]): Promise<string> {
    return trpcClient.aliyunOss.objectUrl.query(args);
  },
  async objectMeta(args: Parameters<ObjectStorageAdapter['objectMeta']>[0]): Promise<ObjectMeta> {
    return trpcClient.aliyunOss.objectMeta.query(args);
  },
  async delete(args: Parameters<ObjectStorageAdapter['delete']>[0]): Promise<void> {
    throw new Error("Function not implemented.");
  }
});

export default createAliyunOssAdapter;
