import { aliyunOSSRouter } from './aliyun.oss';
import { transformer } from '../../utils/trpc';
import { createRouter } from '../utils/createRouter';

export const appRouter = createRouter()
  .transformer(transformer)
  .merge('aliyun_oss.', aliyunOSSRouter)
;

export type AppRouter = typeof appRouter;