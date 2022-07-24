import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import OperatioWorker from './OperationWorker';
import {
  waitListAtom,
  inProgressListAtom,
  operationListAtom,
  startOperationAtom,
} from './atoms';

const CONCURRENCY = 50;

const OperationsService: React.FC = () => {
  const [waitList] = useAtom(waitListAtom);
  const [inProgressList] = useAtom(inProgressListAtom);
  const [operationList] = useAtom(operationListAtom);
  const [, startOperation] = useAtom(startOperationAtom);

  useEffect(() => {
    if (waitList.length === 0 || inProgressList.length >= CONCURRENCY) {
      return
    };
    const item = waitList[0];
    startOperation(item);
  }, [waitList, inProgressList, startOperation]);

  return (
    <>
      {operationList.map((item) => {
        return (
          <OperatioWorker 
            key={item.id}
            item={item}
          />
        );
      })}
    </>
  );
};

export default OperationsService;