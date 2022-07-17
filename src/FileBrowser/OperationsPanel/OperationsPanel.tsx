import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import { css, styled } from '@mui/system';
import { v4 as uuidv4 } from 'uuid';
import OperationControl from './OperationControl';

const Root = styled('div')(() => css`
  
`);

type RenameOperation = {
  id: string,
  type: 'rename',
  source: string,
  destination: string,
};

export type Operation = RenameOperation;

export type NewOperation = Omit<Operation, 'id'>;

type OperationListAction = {
  type: 'add',
  item: Operation,
} | {
  type: 'addMultiple',
  items: Operation[],
} | {
  type: 'remove',
  id: string,
};

const operationListReducer = (value: Operation[], action: OperationListAction): Operation[] => {
  if (!action) {
    return value;
  }
  switch (action.type) {
    case 'add':
      return [...value, action.item];

    case 'addMultiple':
      return [...value, ...action.items];

    case 'remove':
      return value.filter((op) => op.id !== action.id);
  }
}

export const operationListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
const inProgressListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
const waitListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
const doneListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
const stoppedListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);

export const queueOperationsAtom = atom(
  null,
  (get, set, value: NewOperation[]) => {
    const items = value.map((op) => ({
      ...op,
      id: uuidv4(),
    }));
    set(operationListAtom, {
      type: 'addMultiple',
      items,
    });
    set(waitListAtom, {
      type: 'addMultiple',
      items,
    });
  }
)

const CONCURRENCY = 50;

const OperationsPanel: React.FC = () => {
  const [waitList, dispatchToWaitList] = useAtom(waitListAtom);
  const [doneList, dispatchToDoneList] = useAtom(doneListAtom);
  const [stoppedList, dispatchToStoppedList] = useAtom(stoppedListAtom);

  const [inProgressList, dispatchToInProgressList] = useAtom(inProgressListAtom);
  const [operationList, dispatchToOperationList] = useAtom(operationListAtom);

  useEffect(() => {
    if (waitList.length === 0 || inProgressList.length >= CONCURRENCY) {
      return
    };
    const item = waitList[0];
    dispatchToWaitList({ type: 'remove', id: item.id });
    dispatchToInProgressList({ type: 'add', item });
  }, [waitList, inProgressList]);

  return (
    <Root>
      {operationList.map((item) => {
        const isInProgress = inProgressList.includes(item);
        const isOnHold = waitList.includes(item);
        const isDone = doneList.includes(item);
        const isStopped = stoppedList.includes(item);
        return (
          <OperationControl 
            key={item.id}
            item={item}
            isOnHold={isOnHold}
            isDone={isDone}
            isStopped={isStopped}
            isInProgress={isInProgress}
            onSuccess={() => {
              dispatchToDoneList({ type: 'add', item });
              dispatchToInProgressList({ type: 'remove', id: item.id });
            }}
            onClose={() => {
              if (isOnHold) {
                dispatchToWaitList({ type: 'remove', id: item.id });
              }
              if (isDone) {
                dispatchToDoneList({ type: 'remove', id: item.id });
              }
              if (isStopped) {
                dispatchToStoppedList({ type: 'remove', id: item.id });
              }
              dispatchToOperationList({ type: 'remove', id: item.id });
            }}
            onStop={() => {
              dispatchToInProgressList({ type: 'remove', id: item.id });
              dispatchToStoppedList({ type: 'add', item });
            }}
            onStart={() => {
              dispatchToStoppedList({ type: 'remove', id: item.id });
              dispatchToWaitList({ type: 'add', item });
            }}
          />
        );
      })}
    </Root>
  );
};

export default OperationsPanel;