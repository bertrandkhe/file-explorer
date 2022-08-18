import { Paper } from '@mui/material';
import React, { useMemo } from 'react';
import createAliyunOssAdapter from '../adapters/aliyunOssAdapter';
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
        allowedExtensions={['.jpg', '.jpeg', '.png', '.ico']}
        onChooseFiles={(files) => {
          console.log(files);
        }}
        onClose={() => {
          console.log('on close');
        }}
      />
    </Paper>
  );
};

export default Home;