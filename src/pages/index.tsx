import { Paper } from '@mui/material';
import React, { useMemo } from 'react';
import createAliyunOssAdapter from '../adapters/aliyunOssAdapter';
import createDiskAdapter from 'src/adapters/diskAdapter';
import FileBrowser, { denyAllPermissions, ObjectStorageAdapter } from '@/FileBrowser';

const Home: React.FC = () => {
  const adapter = useMemo<ObjectStorageAdapter>(() => {
    return createAliyunOssAdapter();
  }, []);
  return (
    <Paper 
      style={{ width: '80vw', height: '80vh', margin: '10vh auto 0' }}
      elevation={5}
    >
      <FileBrowser 
        adapter={adapter}
        viewMode="grid"
        permissions={{
          ...denyAllPermissions,
          canUpload: true,
          canMkdir: true,
        }}
        allowedExtensions={[]}
      />
    </Paper>
  );
};

export default Home;