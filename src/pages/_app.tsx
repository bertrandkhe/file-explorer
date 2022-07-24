import { CssBaseline } from "@mui/material";
import { withTRPC } from '@trpc/next';
import { AppType } from 'next/dist/shared/lib/utils';
import { transformer } from '../utils/trpc';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  );
};

export default withTRPC({
  config() {
    return {
      url: '/api/trpc',
      transformer,
    };
  },
  ssr: false,
})(MyApp);
