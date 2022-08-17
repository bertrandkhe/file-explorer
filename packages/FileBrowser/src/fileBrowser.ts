import React from 'react';
import { UseQueryResult, useMutation, useQuery, UseQueryOptions, UseMutationResult, UseMutationOptions, useQueryClient, QueryClient } from 'react-query';

export interface Object {
  id: string,
  type: 'file',
  key: string,
  size: number,
  name: string,
  lastModified: string,
}

export interface ObjectMeta {
  name: string,
  url: string,
  uri: string,
  contentType: string,
  size: string,
  md5?: string,
  exif?: {
    width: number,
    height: number,
  },
}

export interface Folder {
  id: string,
  type: 'folder',
  prefix: string,
  name: string,
}

export interface ObjectStorageAdapter {
  ls(args: { 
    prefix: string
  }): Promise<{
    objects: Object[],
    folders: Folder[],
    isTruncated: boolean,
    count: number,
  }>

  upload(args: {
    key: string,
    file: File,
    onProgress?: XMLHttpRequestUpload['onprogress'],
    onReady?(xhr: XMLHttpRequest): void,
  }): Promise<string>

  mkdir(args: {
    key: string,
  }): Promise<void>

  rename(args: {
    source: string,
    destination: string,
  }): Promise<void>

  objectUrl(args: {
    key: string,
    expires?: number,
  }): Promise<string>

  imagePreviewUrl(args: {
    key: string,
    expires?: number,
    width: number,
  }): Promise<string>

  objectMeta(args: {
    key: string,
  }): Promise<ObjectMeta>

  delete(args: {
    key: string,
  }): Promise<void>
}

type QueryKey = string & keyof Pick<ObjectStorageAdapter, 'ls' | 'objectMeta' | 'objectUrl' | 'imagePreviewUrl'>;
type MutationKey = string & keyof Pick<ObjectStorageAdapter, 'mkdir' | 'rename' | 'delete' | 'upload'>;

export type Prefix<K extends string, T extends string> = `${K}${T}`;

export interface ReactQueryHooks<QueryKeyPrefix extends string> {
  getQueryKey<Key extends QueryKey>(key: Key): Prefix<QueryKeyPrefix, Key>

  useInvalidateQueries<
    Key extends QueryKey,
    QueryFn extends ObjectStorageAdapter[Key],
  >(): (args: [key: Key, input: Partial<Parameters<QueryFn>[0]>]) => Promise<void>;

  useQuery<
    Key extends QueryKey,
    QueryFn extends ObjectStorageAdapter[Key],
    QueryData extends Awaited<ReturnType<QueryFn>>
  >(args: [
    key: Key, 
    input: Parameters<QueryFn>[0]
  ], options?: Omit<UseQueryOptions<QueryData>, 'queryKey'>): UseQueryResult<QueryData>;

  useMutation<
    Key extends MutationKey,
    MutationFn extends ObjectStorageAdapter[Key],
    MutationData extends Awaited<ReturnType<MutationFn>>,
    Variables extends Parameters<MutationFn>[0],
  >(args: [
    key: Key,
  ], options?: Omit<UseMutationOptions<MutationData, unknown, Variables>, 'mutationKey'>): UseMutationResult<MutationData, unknown, Variables>
}



export type FileBrowserContextValue = {
  adapter: ObjectStorageAdapter,
};

export const FileBrowserContext = React.createContext<FileBrowserContextValue | null>(null);

export const useContext = (): FileBrowserContextValue => {
  const context = React.useContext(FileBrowserContext);
  if (!context) {
    throw new Error('');
  }
  return context;
}

export const createReactQueryHooks = <QueryKeyPrefix extends string>(options: {
  prefix: QueryKeyPrefix
}): ReactQueryHooks<QueryKeyPrefix> => {
  const { prefix } = options;
  let queryClient = null as QueryClient | null;

  const getQueryKey = <Key extends QueryKey>(key: Key): Prefix<QueryKeyPrefix, Key> => {
    return `${prefix}${key}`;
  };

  const invalidateQueries: ReturnType<ReactQueryHooks<QueryKeyPrefix>['useInvalidateQueries']> = (args) => {
    if (!queryClient) {
      throw new Error('queryClient is not instantiated.');
    }
    return queryClient.invalidateQueries([
      getQueryKey(args[0]),
      args[1],
    ]);
  };

  return {
    getQueryKey,
    useInvalidateQueries() {
      queryClient = useQueryClient();
      return invalidateQueries;
    },

    useQuery(args, options) {
      const { adapter } = useContext();
      const operation = args[0];
      const queryFn = adapter[operation];
      const queryKey = [this.getQueryKey(args[0]), args[1]];
      return useQuery<any>(queryKey, () => queryFn(args[1] as any), options);
    },

    useMutation(args, options) {
      const { adapter } = useContext();
      const mutateFn = adapter[args[0]];
      return useMutation<any, any, any>((vars) => {
        return mutateFn(vars as any);
      }, options);
    }
  }
};

export const fileBrowser = createReactQueryHooks({
  prefix: 'fileBrowser.',
});
