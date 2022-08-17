import { atomWithReducer } from 'jotai/utils';
import { atom } from 'jotai';
import { v4 as uuidv4 } from 'uuid';
import { Operation, NewOperation, OperationStatus } from './types';

type OperationListAction = {
  type: 'add',
  op: Operation,
} | {
  type: 'addMultiple',
  ops: Operation[],
} | {
  type: 'remove',
  id: string,
} | {
  type: 'replace',
  op: Operation,
};


const operationListReducer = (value: Operation[], action: OperationListAction): Operation[] => {
  if (!action) {
    return value;
  }
  switch (action.type) {
    case 'add':
      return [...value, action.op];

    case 'replace': {
      const newValue = value.map((op) => {
        if (op.id !== action.op.id) {
          return op;
        }
        return action.op;
      });
      return newValue;
    }

    case 'addMultiple':
      return [...value, ...action.ops];

    case 'remove':
      return value.filter((op) => op.id !== action.id);
  }
}

export const operationListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
export const inProgressListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
export const waitListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
export const doneListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);
export const stoppedListAtom = atomWithReducer<Operation[], OperationListAction>([], operationListReducer);

export const queueOperationsAtom = atom(
  null,
  (get, set, value: NewOperation[]) => {
    const ops = value.map((op) => ({
      ...op,
      id: uuidv4(),
      status: OperationStatus.ON_HOLD,
    }));
    set(operationListAtom, {
      type: 'addMultiple',
      ops,
    });
    set(waitListAtom, {
      type: 'addMultiple',
      ops,
    });
  }
);

export const roOperationListAtom = atom(
  (get) => get(operationListAtom),
);

export const closeOperationAtom = atom(
  null,
  (get, set, op: Operation) => {
    switch (op.status) {
      case OperationStatus.ON_HOLD:
        set(waitListAtom, {
          type: 'remove',
          id: op.id,
        });
        break;

      case OperationStatus.DONE:
        set(doneListAtom, {
          type: 'remove',
          id: op.id,
        });
        break;

      case OperationStatus.STOPPED:
        set(stoppedListAtom, {
          type: 'remove',
          id: op.id,
        });
        break;

      case OperationStatus.IN_PROGRESS:
        throw new Error('Cannot close operation while it is running.');
    }
    set(operationListAtom, { type: 'remove', id: op.id });
  },
);

export const startOperationAtom = atom(
  null,
  (get, set, op: Operation) => {
    console.log(op);
    switch (op.status) {
      case OperationStatus.IN_PROGRESS:
      case OperationStatus.DONE:  
        throw new Error('Fail to start operation');

      case OperationStatus.ON_HOLD:
      case OperationStatus.FAILED:
      case OperationStatus.STOPPED:
        if (
          op.status === OperationStatus.FAILED
          || op.status === OperationStatus.STOPPED
        ) {
          set(stoppedListAtom, {
            type: 'remove',
            id: op.id,
          });
        }
        if (op.status === OperationStatus.ON_HOLD) {
          set(waitListAtom, {
            type: 'remove',
            id: op.id,
          });
        }
        const newOp = {
          ...op,
          status: OperationStatus.IN_PROGRESS,
        };
        set(operationListAtom, {
          type: 'replace',
          op: newOp,
        });
        set(inProgressListAtom, {
          type: 'add',
          op: newOp,
        });
        break;
    }
  },
);

export const stopOperationAtom = atom(
  null,
  (get, set, op: Operation) => {
    switch (op.status) {
      case OperationStatus.IN_PROGRESS:
      case OperationStatus.STOPPED:
      case OperationStatus.DONE:  
        throw new Error('Fail to start operation');

      case OperationStatus.ON_HOLD:
        set(waitListAtom, {
          type: 'remove',
          id: op.id,
        });
        const newOp = {
          ...op,
          status: OperationStatus.STOPPED,
        };
        set(operationListAtom, {
          type: 'replace',
          op: newOp,
        });
        set(stoppedListAtom, {
          type: 'add',
          op: newOp,
        });
        break;
    }
  },
);

export const finalizeOperationAtom = atom(
  null,
  (get, set, op: Operation) => {
    switch (op.status) {
      case OperationStatus.ON_HOLD:
      case OperationStatus.STOPPED:
      case OperationStatus.DONE:  
        throw new Error('Fail to finalize operation');

      case OperationStatus.IN_PROGRESS:
        set(inProgressListAtom, {
          type: 'remove',
          id: op.id,
        });
        const newOp = {
          ...op,
          status: OperationStatus.DONE,
        };
        set(operationListAtom, {
          type: 'replace',
          op: newOp,
        });
        set(doneListAtom, {
          type: 'add',
          op: newOp,
        });
        break;
    }
  },
);

export const failOperationAtom = atom(
  null,
  (get, set, value: { op: Operation, error: unknown }) => {
    const { op, error } = value;
    switch (op.status) {
      case OperationStatus.ON_HOLD:
      case OperationStatus.STOPPED:
      case OperationStatus.DONE:  
        throw new Error('Fail to finalize operation');

      case OperationStatus.IN_PROGRESS:
        set(inProgressListAtom, {
          type: 'remove',
          id: op.id,
        });
        const failedOp = {
          ...op,
          status: OperationStatus.FAILED,
          error,
        };
        set(operationListAtom, {
          type: 'replace',
          op: failedOp,
        });
        set(stoppedListAtom, {
          type: 'add',
          op: failedOp,
        });
        break;
    }
  }
)