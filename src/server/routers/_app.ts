import { aliyunOSSRouter } from './aliyun.oss';
import { diskRouter } from './disk';
import { transformer } from '../../utils/trpc';
import { createRouter } from '../utils/createRouter';

export const appRouter = createRouter()
  .transformer(transformer)
  .merge('aliyun_oss.', aliyunOSSRouter)
  .merge('disk.', diskRouter)
;

export type AppRouter = typeof appRouter;