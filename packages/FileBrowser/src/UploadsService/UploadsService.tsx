import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  uploadListAtom, 
  waitListAtom,
  inProgressListAtom,
} from './atoms';
import UploadWorker from './UploadWorker';
import useUploadControls from './hooks';

const CONCURRENCY = 10;

const UploadsService: React.FC = () => {
  const [uploadList] = useAtom(uploadListAtom);
  const [waitList] = useAtom(waitListAtom);
  const [inProgressList] = useAtom(inProgressListAtom);
  const { startUpload } = useUploadControls();

  useEffect(() => {
    if (waitList.length === 0 || inProgressList.length === CONCURRENCY) {
      return;
    }
    const nextItem = waitList[0];
    startUpload(nextItem);
  }, [waitList, inProgressList]);

  return (
    <>
      {uploadList.map((item) => (
        <UploadWorker item={item} key={item.id} />
      ))}
    </>
  );
};

export default UploadsService;
