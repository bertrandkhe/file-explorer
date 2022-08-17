import { 
    ObjectStorageAdapter,
    Folder,
    ObjectMeta,
    Object,
  } from "@/FileBrowser";
  import { client } from "../utils/trpc";
  
  
  const createDiskAdapter = (): ObjectStorageAdapter => ({
    async ls(args: { prefix: string; }): Promise<{ 
      objects: Object[];
      folders: Folder[];
      isTruncated: boolean; 
      count: number; 
    }> {
      const prefix = args.prefix.startsWith('/') ? args.prefix.slice(1) : args.prefix;
      const result = await client.query('disk.listObjects', {
        prefix,
      });
      return result;
    },
    async upload(args: Parameters<ObjectStorageAdapter['upload']>[0]): Promise<string> {
      return '';
    },
    async mkdir(args: { key: string; }): Promise<void> {
      await client.mutation('disk.createFolder', args);
    },
    async rename(args: { source: string; destination: string; }): Promise<void> {
      await client.mutation('disk.rename', args);
    },
    async imagePreviewUrl(args: Parameters<ObjectStorageAdapter['imagePreviewUrl']>[0]) {
      return client.query('disk.imagePreviewUrl', args);
    },
    async objectUrl(args: Parameters<ObjectStorageAdapter['objectUrl']>[0]): Promise<string> {
      return client.query('disk.objectUrl', args);
    },
    async objectMeta(args: Parameters<ObjectStorageAdapter['objectMeta']>[0]): Promise<ObjectMeta> {
      return client.query('disk.objectMeta', args);
    },
    async delete(args: Parameters<ObjectStorageAdapter['delete']>[0]): Promise<void> {
      throw new Error("Function not implemented.");
    }
  });
  
  export default createDiskAdapter;