import { z } from 'zod';

/*eslint sort-keys: "error"*/
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  ALIYUN_ACCESSKEY_ID: z.string(),
  ALIYUN_ACCESSKEY_SECRET: z.string(),
  ALIYUN_REGION: z.string(),
  ALIYUN_OSS_REGION: z.string().optional(),
  ALIYUN_OSS_BUCKET: z.string(),
  ALIYUN_OSS_BUCKET_URL: z.string().optional(),
  ALIYUN_MAX_OBJECT_SIZE: z.preprocess(
    (arg) => Number.parseInt(String(arg), 10),
    z.number().positive(),
  ),
  DISK_ROOT: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(env.error.format(), null, 4),
  );
  process.exit(1);
}

const data = env.data;

export default data;