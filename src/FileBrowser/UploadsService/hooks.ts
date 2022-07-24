import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { 
  finalizeUploadAtom,
  closeUploadItemAtom,
  stopUploadAtom, 
  startUploadAtom,
  failUploadAtom,
  queueFilesForUploadAtom,
  uploadListAtom,
} from './atoms';
import UploadItem, { Progress } from './UploadItem';

export const useUploadControls = () => {
  const [, uploadFiles] = useAtom(queueFilesForUploadAtom);
  const [, finalizeUpload] = useAtom(finalizeUploadAtom);
  const [, failUpload] = useAtom(failUploadAtom);
  const [, closeUpload] = useAtom(closeUploadItemAtom);
  const [, startUpload] = useAtom(startUploadAtom);
  const [, stopUpload] = useAtom(stopUploadAtom);

  return {
    uploadFiles,
    finalizeUpload,
    failUpload,
    closeUpload,
    startUpload,
    stopUpload,
  };
};

export const useUploadStatus = (upload: UploadItem) => {
  const [uploadMemo] = useState(upload);
  const [status, setStatus] = useState({
    status: uploadMemo.getStatus(),
    isOnHold: uploadMemo.isOnHold(),
    isInProgress: uploadMemo.isInProgress(),
    isDone: uploadMemo.isDone(),
    isStopped: uploadMemo.isStopped(),
    hasFailed: uploadMemo.hasFailed(),
  });

  useEffect(() => {
    const handleChange = () => {
      setStatus({
        status: uploadMemo.getStatus(),
        isOnHold: uploadMemo.isOnHold(),
        isInProgress: uploadMemo.isInProgress(),
        isDone: uploadMemo.isDone(),
        isStopped: uploadMemo.isStopped(),
        hasFailed: uploadMemo.hasFailed(),
      });
    };
    uploadMemo.addEventListener('change', handleChange);
    handleChange();
    return () => uploadMemo.removeEventListener('change', handleChange);
  }, [uploadMemo]);
  
  return status;
}

export const useUploadProgress = (upload: UploadItem) => {
  const [uploadMemo] = useState(upload);
  const [progress, setProgress] = useState(upload.getProgress());
  useEffect(() => {
    const handleProgress = (currentProgress: Progress) => {
      setProgress(currentProgress);
    };
    uploadMemo.addEventListener('progress', handleProgress);
    return () => uploadMemo.removeEventListener('progress', handleProgress);
  }, [uploadMemo]);
  
  return progress;
}

export const useUploadList = () => {
  const [uploadList] = useAtom(uploadListAtom);
  return uploadList;
}

export default useUploadControls;