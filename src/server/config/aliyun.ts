import env from "../env";

console.log(env);

export const accessKeyId = env.ALIYUN_ACCESSKEY_ID || '';
export const accessKeySecret = env.ALIYUN_ACCESSKEY_SECRET || '';
export const region = env.ALIYUN_REGION || '';

export const ossRegion = env.ALIYUN_OSS_REGION || region;
export const ossBucket = env.ALIYUN_OSS_BUCKET || '';
export const ossBucketUrl = env.ALIYUN_OSS_BUCKET_URL || `https://${ossBucket}.oss-${ossRegion}.aliyuncs.com`;
export const ossMaxObjectSize = env.ALIYUN_MAX_OBJECT_SIZE;


export default {
  accessKeyId,
  accessKeySecret,
  ossBucket,
  ossMaxObjectSize,
};