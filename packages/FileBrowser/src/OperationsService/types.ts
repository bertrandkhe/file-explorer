export enum OperationStatus {
  ON_HOLD = 0,
  IN_PROGRESS = 1,
  DONE = 2,
  STOPPED = 3,
  FAILED = -1
}

type OperationBase = {
  id: string,
  type: unknown,
  status: Omit<OperationStatus, OperationStatus.FAILED>,
} | {
  id: string,
  type: unknown,
  status: OperationStatus.FAILED,
  error: unknown,
};

export type RenameOperation = OperationBase & {
  type: 'rename',
  source: string,
  destination: string,
};

export type Operation = RenameOperation;

export type NewOperation = Omit<Operation, 'id' | 'status' | 'error'>;