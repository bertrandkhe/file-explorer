import { createHmac } from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { XMLParser } from 'fast-xml-parser';
import {
  accessKeyId,
  accessKeySecret,
  ossBucket,
  ossMaxObjectSize,
  ossBucketUrl,
} from '../config/aliyun';

dayjs.extend(utc);

type Response = globalThis.Response & {
  xml<V>(): Promise<V>
};

type ListObjectsContentItem = {
  ETag: string,
  Key: string,
  LastModified: string,
  Size: number,
  StorageClass: 'Standard',
  Type: 'Normal',
}; 

export type ListObjectsResult = {
  ListBucketResult: {
    CommonPrefixes?: {
      Prefix: string,
    } | {
      Prefix: string,
    }[],
    Contents?: ListObjectsContentItem[] | ListObjectsContentItem,
    Delimiter: string,
    IsTruncated: boolean,
    KeyCount: number,
    MaxKeys: number,
    Name: string,
    Prefix: string,
  }
};

function createXMLResponse(inputRes: globalThis.Response): Response {
  const res = Object.assign(Object.create(inputRes, {
    xml: {
      value: async function<V>(): Promise<V> {
        const parser = new XMLParser();
        return parser.parse(await inputRes.text()) as V;
      },
    },
  }), inputRes);
  return res;
}

export const signUrl = (options: {
  url: string,
  expires?: number,
}) => {
  const {
    url: propsUrl,
    expires = dayjs().add(30, 'seconds').unix(),
  } = options;
  const url = new URL(propsUrl);
  const key = `${decodeURI(url.pathname.slice(1))}${url.search}`;
  const signatureHmac = createHmac('sha1', accessKeySecret);
  const signatureString = [
    'GET',
    '',
    '',
    expires,
    `/${ossBucket}/${key}`,
  ].join('\n');
  signatureHmac.update(Buffer.from(signatureString, 'utf-8'));
  const signature = signatureHmac.digest('base64');
  url.searchParams.set('OSSAccessKeyId', accessKeyId);
  url.searchParams.set('Expires', `${expires}`);
  url.searchParams.set('Signature', signature);
  return url.toString();
};

// https://partners-intl.aliyun.com/help/en/object-storage-service/latest/access-control-include-signatures-in-the-authorization-header#section-dbw-1bf-xdb
export const signedFetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
  const inputStr = input.toString();
  const url = new URL(inputStr);
  const key = url.pathname.length > 1 ? `${decodeURI(url.pathname.slice(1))}${url.search}` : '';
  const fetchOptions = init ?? {};
  const headers = fetchOptions.headers || {};
  const ossHeaders = Object.keys(headers).filter((k) => k.startsWith('x-oss-')) as (keyof typeof headers)[];
  let canonicalizedOSSHeaders = '';
  ossHeaders.forEach((name) => {
    const value = headers[name];
    canonicalizedOSSHeaders = `${name}:${value}\n`;
  });
  const signatureHmac = createHmac('sha1', accessKeySecret);
  const date = `${dayjs.utc().format('ddd, DD MMM YYYY HH:mm:ss')} GMT`;
  const signatureString = [
    init?.method || 'GET',
    '',
    '',
    date,
    `${canonicalizedOSSHeaders}/${ossBucket}/${key}`,
  ].join('\n');
  signatureHmac.update(Buffer.from(signatureString, 'utf-8'));
  const signature = signatureHmac.digest('base64');
  const authorization = `OSS ${accessKeyId}:${signature}`;
  const response = await fetch(input, {
    ...fetchOptions,
    headers: {
      ...headers,
      Date: date,
      Authorization: authorization,
    },
  });
  return createXMLResponse(response);
}

export const createPostObjectData = (args: {
  key: string, 
  contentType?: string,
  filesize: number,
}) => {
  const { 
    key,
    contentType,
    filesize,
  } = args;
  // About policy: https://partners-intl.aliyun.com/help/en/object-storage-service/latest/postobject#section-d5z-1ww-wdb
  const policy = {
    expiration: dayjs().add(10, 'minutes').toISOString(),
    conditions: [
      {
        bucket: ossBucket,
      },
      ['content-length-range', 1, filesize],
      ['eq', '$key', key],
    ],
  };
  if (contentType) {
    policy.conditions.push(['eq', '$Content-Type', contentType]);
  }
  const signatureHmac = createHmac('sha1', accessKeySecret);
  const policyBase64 = Buffer.from(JSON.stringify(policy), 'utf-8').toString('base64');
  signatureHmac.update(policyBase64);
  const signature = signatureHmac.digest('base64');
  return {
    accessKeyId,
    signature,
    key,
    policyBase64,
    endpoint: ossBucketUrl,
    bucket: ossBucket,
    successActionsStatus: '200',
  };
}