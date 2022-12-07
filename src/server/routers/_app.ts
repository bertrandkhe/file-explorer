import { router } from "../trpc";
import { aliyunOssRouter } from "./aliyunOssRouter";

export const appRouter = router({
  aliyunOss: aliyunOssRouter,
});

export type AppRouter = typeof appRouter;