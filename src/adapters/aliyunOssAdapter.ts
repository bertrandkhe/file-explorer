import { 
  ObjectStorageAdapter,
  Folder,
  ObjectMeta,
  Object,
} from "@/FileBrowser";
import { client } from "../utils/trpc";


const createAliyunOssAdapter = (): ObjectStorageAdapter => ({
  async ls(args: { prefix: string; }): Promise<{ 
    objects: Object[];
    folders: Folder[];
    isTruncated: boolean; 
    count: number; 
  }> {
    const prefix = args.prefix.startsWith('/') ? args.prefix.slice(1) : args.prefix;
    const result = await client.query('aliyun_oss.listObjects', {
      prefix,
    });
    return result;
  },
  async upload(args: Parameters<ObjectStorageAdapter['upload']>[0]): Promise<string> {
    const { key, file, onProgress, onReady } = args;
    const signData = await client.query('aliyun_oss.postObjectData', {
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
    await client.mutation('aliyun_oss.createFolder', args);
  },
  async rename(args: { source: string; destination: string; }): Promise<void> {
    await client.mutation('aliyun_oss.rename', args);
  },
  async imagePreviewUrl(args: Parameters<ObjectStorageAdapter['imagePreviewUrl']>[0]) {
    return client.query('aliyun_oss.imagePreviewUrl', args);
  },
  async objectUrl(args: Parameters<ObjectStorageAdapter['objectUrl']>[0]): Promise<string> {
    return client.query('aliyun_oss.objectUrl', args);
  },
  async objectMeta(args: Parameters<ObjectStorageAdapter['objectMeta']>[0]): Promise<ObjectMeta> {
    return client.query('aliyun_oss.objectMeta', args);
  },
  async delete(args: Parameters<ObjectStorageAdapter['delete']>[0]): Promise<void> {
    throw new Error("Function not implemented.");
  }
});

export default createAliyunOssAdapter;