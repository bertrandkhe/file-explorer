import { z } from 'zod';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';
import { router, procedure } from '../trpc';
import {
  ossBucket,
  ossBucketUrl,
  ossMaxObjectSize,
} from '../config/aliyun';
import { createPostObjectData, ListObjectsResult, signedFetch, signUrl } from '../utils/aliyun.oss.sdk';

const filenameRegex = /^[\(\);.a-zA-Z0-9_-\s]{1,128}\.[a-z]{2,4}$/;
const keyRegex = /^[\(\)a-zA-Z0-9_-\s]{1,128}\.[a-z]{2,4}$/;
// const directoryRegex = /^\/([a-zA-Z0-9_-\s]+\/)*/;
const prefixRegex = /^([\(\)a-zA-Z0-9_-\s]+\/)*/;

export const aliyunOssRouter = router({
  postTmpObjectData: procedure
    .input(z.object({
      filename: z.string().regex(filenameRegex),
      contentType: z.string().regex(/^[a-z]+\/[a-z]+/).optional(),
      filesize: z.number().positive().lte(ossMaxObjectSize),
    }))
    .query(({ input }) => {
      const {
        filename, 
        contentType,
        filesize,
      } = input;
      const key = `tmp/${dayjs().format('YYYY-MM-DD')}/${filename}`;
      return createPostObjectData({
        key,
        contentType,
        filesize,
      });      
    }),
  postObjectData: procedure
    .input(z.object({
      key: z.string().regex(keyRegex),
      contentType: z.string().regex(/^[a-z]+\/[a-z]+/i).optional(),
      filesize: z.number().positive().lte(ossMaxObjectSize),
    }))
    .query(({ input }) => {
      const {
        key, 
        contentType,
        filesize,
      } = input;
      return createPostObjectData({
        key,
        contentType,
        filesize,
      });      
    }),
  signUrl: procedure
    .input(z.object({
      url: z.string().url(),
    }))
    .query(({ input }) => {
      return signUrl({
        ...input,
      });
    }),
  imagePreviewUrl: procedure
    .input(z.object({
      key: z.string().regex(keyRegex),
      expires: z.number().optional(),
      width: z.number(),
    }))
    .query(({ input }) => {
      const endpoint = `${ossBucketUrl}/${input.key}?x-oss-process=image/resize,w_${input.width}/quality,q_70/format,webp`;
      return signUrl({
        url: endpoint,
        expires: input.expires,
      });
    }),
  objectUrl: procedure
    .input(z.object({
      key: z.string().regex(keyRegex),
      expires: z.number().optional(),
    }))
    .query(({ input }) => {
      const endpoint = `${ossBucketUrl}/${input.key}`;
      return signUrl({
        url: endpoint,
        expires: input.expires,
      });
    }),
  objectMeta: procedure
    .input(z.object({
      key: z.string().regex(keyRegex),
    }))
    .query(async ({ input }) => {
      const endpoint = `${ossBucketUrl}/${input.key}`;
      const response = await signedFetch(endpoint, {
        method: 'HEAD',
      });
      const headers = response.headers;
      const contentType = headers.get('content-type') || '';
      const exif = {
        width: 0,
        height: 0,
      };
      if (response.ok) {
        if (contentType.startsWith('image/')) {
          const exifResponse = await signedFetch(`${endpoint}?x-oss-process=image/info`);
          if (exifResponse.ok) {
            const exifData = await exifResponse.json() as {
              ImageHeight: { value: string },
              ImageWidth: { value: string },
              Format: { value: string },
            };
            exif.width = Number.parseInt(exifData.ImageWidth.value, 10);
            exif.height = Number.parseInt(exifData.ImageHeight.value, 10);
          }
        }
        return {
          name: input.key.split('/').pop() as string,
          url: endpoint,
          uri: `oss://${ossBucket}/${input.key}`,
          contentType,
          size: headers.get('content-length') as string,
          md5: headers.get('content-md5') as string,
          exif: exif.width > 0 ? exif : undefined,
        };
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        cause: await response.text(),
      });
    }),
  listObjects: procedure
    .input(z.object({
      prefix: z.string().regex(prefixRegex).optional(),
    }))
    .query(async ({ input }) => {
      const { prefix = '' } = input;
      const endpointUrl = new URL(ossBucketUrl);
      endpointUrl.searchParams.set('list-type', '2');
      endpointUrl.searchParams.set('prefix', prefix);
      endpointUrl.searchParams.set('delimiter', '/');
      const response = await signedFetch(endpointUrl.toString());
      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: await response.text(),
        });
      }
      const listObjectsResult = await response.xml<ListObjectsResult>();
      const resultContents = listObjectsResult.ListBucketResult.Contents || [];
      const resultCommonPrefixes = listObjectsResult.ListBucketResult.CommonPrefixes || [];
      const contentsArray = Array.isArray(resultContents) 
        ? resultContents 
        : [resultContents];
      // Skip first item if it is the folder.
      if (contentsArray.length >= 1 && contentsArray[0]?.Key.endsWith('/')) {
        contentsArray.shift();
      }
      const commonPrefixesArray = Array.isArray(resultCommonPrefixes) ? resultCommonPrefixes : [resultCommonPrefixes];
      const normalizedResult = {
        objects: contentsArray.map((object) => ({
          id: object.Key,
          type: 'file' as 'file',
          key: object.Key,
          size: object.Size,
          name: object.Key.split('/').filter((s) => s.length > 0).pop() as string,
          lastModified: object.LastModified
        })) || [],
        folders: commonPrefixesArray.map((p) => {
          return {
            id: p.Prefix,
            type: 'folder' as 'folder',
            prefix: p.Prefix,
            name: p.Prefix.split('/').filter((s) => s.length > 0).pop() as string,
          };
        }) || [],
        isTruncated: listObjectsResult.ListBucketResult.IsTruncated,
        count: listObjectsResult.ListBucketResult.KeyCount,
      };
      return normalizedResult;

    }),
  createFolder: procedure
    .input(z.object({
      key: z.string()
    }))
    .mutation(async ({ input }) => {
      const endpoint = `${ossBucketUrl}/${input.key}`.replace(/\/?$/, '/');
      await signedFetch(endpoint, {
        method: 'PUT',
      });
    }),
  rename: procedure
    .input(z.object({
      destination: z.string().regex(keyRegex),
      source: z.string().regex(keyRegex),
    }))
    .mutation(async ({ input }) => {
      const response = await signedFetch(`${ossBucketUrl}/${input.destination}?x-oss-rename`, {
        method: 'POST',
        headers: {
          'x-oss-rename-source': input.source,
        },
      });
      if (response.status !== 200) {
        console.log({
          input,
          responseBody: await response.xml(),
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
});
