import React, { useEffect } from 'react';
import { Operation, OperationStatus } from './types';
import { fileBrowser } from '../fileBrowser';
import { finalizeOperationAtom, failOperationAtom } from './atoms';
import { useAtom } from 'jotai';

type OperationWorkerProps = {
  item: Operation,
};


const OperationWorker: React.FC<OperationWorkerProps> = (props) => {
  const { item } = props;
  const [, finalizeOperation] = useAtom(finalizeOperationAtom);
  const [, failOperation] = useAtom(failOperationAtom);

  const renameMutation = fileBrowser.useMutation(['rename'], {
    onSuccess() {
      finalizeOperation(item);
    },
    onError(error) {
      failOperation({
        op: item,
        error,
      });
    }
  });

  useEffect(() => {
    if (item.status === OperationStatus.IN_PROGRESS) {
      switch (item.type) {
        case 'rename':
          renameMutation.mutate(item);
          break;
      }
    }
  }, [item]);

  return null;
}

export default OperationWorker;
