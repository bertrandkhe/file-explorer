import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { createRouter } from '../utils/createRouter';
import {
  root
} from '../config/disk';
import { ObjectStorageAdapter } from '@/FileBrowser';

const filenameRegex = /^[;.a-zA-Z0-9_-\s]{1,128}\.[a-z]{2,4}$/;
const keyRegex = /^([;.a-zA-Z0-9\/]+)?[a-zA-Z0-9_-\s]{1,128}\.[a-z]{2,4}$/;
const directoryRegex = /^\/([a-zA-Z0-9_-\s]+\/)*/;
const prefixRegex = /^([a-zA-Z0-9_-\s]+\/)*/;

type ListObjectResult = {
  objects: {
    id: string,
    type: 'file',
    key: string,
    size: number,
    name: string,
    lastModified: string,
  }[],
  folders: {
    id: string,
    type: 'folder',
    prefix: string,
    name: string,
  }[]
  isTruncated: boolean,
  count: number,
};

export const diskRouter = createRouter()
  .query('imagePreviewUrl', {
    input: z.object({
      key: z.string().regex(keyRegex),
      expires: z.number().optional(),
      width: z.number(),
    }),
    async resolve({ input }) {
      return `/disk?action=download&input=${JSON.stringify({ input })}`;
    },
  })
  .query('objectUrl', {
    input: z.object({
      key: z.string().regex(keyRegex),
      expires: z.number().optional(),
    }),
    async resolve({ input }) {
      return `/disk?action=download&input=${JSON.stringify({ input })}`;
    },
  })
  .query('objectMeta', {
    input: z.object({
      key: z.string(),
    }),
    async resolve({ input }): ReturnType<ObjectStorageAdapter['objectMeta']> {
      const filePath = path.resolve(root, input.key);
      const name = filePath.split('/').pop() as string;
      const stats = await fs.stat(filePath);
      return {
        name,
        contentType: '',
        size: `${stats.size}`,
        url: '',
        uri: '',
      };
    }
  })
  .query('listObjects', {
    input: z.object({
      prefix: z.string().regex(prefixRegex).optional(),
    }),
    async resolve({ input }): Promise<ListObjectResult> {
      const wd = path.resolve(root, input.prefix || '');
      const relPath = wd.substring(root.length);
      const readDirResult = await fs.readdir(wd, {
        withFileTypes: true,
      });
      const output: ListObjectResult = {
        objects: [],
        folders: [],
        isTruncated: false,
        count: readDirResult.length,
      };
      await Promise.all(readDirResult.map(async (value) => {
        const key = `${relPath}/${value.name}`;
        if (value.isDirectory()) {
          const prefix = `${relPath}/${value.name}`;
          output.folders.push({
            id: key,
            type: 'folder',
            prefix: `${key}/`,
            name: value.name,
          });
        }
        else if (value.isFile()) {
          const stat = await fs.stat(`${wd}/${value.name}`);
          output.objects.push({
            id: key,
            key,
            lastModified: stat.mtime.toString(),
            name: value.name,
            size: stat.size,
            type: 'file',
          });
        }
      }));
      return output;
    },
  })
  .mutation('createFolder', {
    input: z.object({
      key: z.string()
    }),
    async resolve({ input }) {
      const dirPath = path.resolve(root, input.key);
      await fs.mkdir(dirPath);
    }
  })
  .mutation('rename', {
    input: z.object({
      destination: z.string().regex(keyRegex),
      source: z.string().regex(keyRegex),
    }),
    async resolve({ input }) {
      const sourcePath = path.resolve(root, input.source);
      const destinationPath = path.resolve(root, input.destination);
      fs.rename(sourcePath, destinationPath);
    }
  })
;
