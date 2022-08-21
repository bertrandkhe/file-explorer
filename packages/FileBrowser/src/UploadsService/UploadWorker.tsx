import React, { useEffect } from 'react';
import UploadItem from './UploadItem';
import { fileBrowser } from '../fileBrowser.lib';
import useUploadControls from './hooks';

type UploadWorkerProps = {
  item: UploadItem,
};


const UploadWorker: React.FC<UploadWorkerProps> = (props) => {
  const { item } = props;
  const { finalizeUpload, failUpload } = useUploadControls();
  const invalidateQueries = fileBrowser.useInvalidateQueries();

  const uploadMutation = fileBrowser.useMutation(['upload'], {
    onSuccess() {
      finalizeUpload(item);
    },
    onError(error) {
      failUpload({
        upload: item,
        error,
      });
    },
  });

  useEffect(() => {
    const handleChange = () => {
      if (item.isInProgress()) {
        uploadMutation.mutate({
          key: item.key,
          file: item.file,
          onProgress(ev) {
            item.setProgress(ev);
          },
          onReady(xhr) {
            item.setXHR(xhr);
          },
        });
      }
      if (item.isDone()) {
        invalidateQueries(['ls', {
          prefix: item.directory.slice(1),
        }]);
      }
    };
    item.addEventListener('change', handleChange);
    return () => {
      item.removeEventListener('change', handleChange);
    }
  }, [item]);

  return null;
}

export default UploadWorker;
