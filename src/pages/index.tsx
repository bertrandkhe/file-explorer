import { Paper } from '@mui/material';
import React, { useMemo } from 'react';
import createAliyunOssAdapter from '../adapters/aliyunOssAdapter';
import FileBrowser from '../FileBrowser';
import { ObjectStorageAdapter } from '../FileBrowser/fileBrowser';

const Home: React.FC = () => {
  const adapter = useMemo<ObjectStorageAdapter>(() => {
    return createAliyunOssAdapter();
  }, []);
  return (
    <Paper 
      style={{ width: '80vw', height: '80vh', margin: '10vh auto 0' }}
      elevation={5}
    >
      <FileBrowser adapter={adapter} />
    </Paper>
  );
};

export default Home;