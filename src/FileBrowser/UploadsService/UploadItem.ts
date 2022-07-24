import { v4 as uuidv4 } from 'uuid';

export enum Status {
  ON_HOLD = 0,
  IN_PROGRESS = 1,
  DONE = 2,
  STOPPED = 3,
  FAILED = -1
}

export type Progress = { loaded: number, total: number };
export type ProgressListener = (progress: Progress) => void;
export type StatusListener = (status: Status) => void;

export class UploadItem {

  public id: string;
  public file: File;
  public key: string;
  public directory: string;

  public error: unknown | null = null;
  public version = 1;

  private status: Status;
  private progress: Progress = {
    loaded: 0,
    total: 0,
  };

  private listeners = {
    progress: [] as ProgressListener[],
    change: [] as StatusListener[],
  };

  private xhr: XMLHttpRequest | null = null;
  
  constructor(file: File, directory: string) {
    this.id = uuidv4();
    this.file = file;
    this.key = `${directory}${file.name}`.slice(1);
    this.directory = directory;
    this.status = Status.ON_HOLD;
  }

  setXHR(xhr: XMLHttpRequest) {
    this.xhr = xhr;
  }

  setProgress(progress: Progress) {
    this.progress = progress;
    this.listeners.progress.forEach((cb) => {
      cb(progress);
    });
  }

  getProgress() {
    return this.progress;
  }

  setStatus(status: Status.FAILED, error: unknown): void;
  setStatus(status: Omit<Status, Status.FAILED>): void;
  setStatus(status: Status, error?: unknown) {
    this.status = status;
    if (error) {
      this.error = error;
    }
    if (this.status === Status.STOPPED && this.xhr) {
      this.xhr.abort();
      this.xhr = null;
      this.setProgress({ loaded: 0, total: 0 });
    }
    this.version += 1;
    this.listeners.change.forEach((cb) => {
      cb(this.status);
    });
  }

  getStatus() {
    return this.status;
  }

  is(status: Status) {
    return this.status === status;
  }
  
  isInProgress() {
    return this.is(Status.IN_PROGRESS);
  }

  isDone() {
    return this.is(Status.DONE);
  }

  isOnHold() {
    return this.is(Status.ON_HOLD);
  }

  isStopped() {
    return this.is(Status.STOPPED);
  }

  hasFailed() {
    return this.is(Status.FAILED);
  }

  addEventListener<EventName extends keyof UploadItem['listeners']>(
    eventName: EventName, 
    cb: UploadItem['listeners'][EventName][0],
  ) {
    this.listeners[eventName].push(cb as any);
  }

  removeEventListener<
    EventName extends keyof UploadItem['listeners'],
    EventListener extends UploadItem['listeners'][EventName][0],
  >(
    eventName: EventName, 
    cb: EventListener,
  ) {
    const listeners = this.listeners[eventName] as EventListener[];
    this.listeners[eventName] = listeners.filter((fn) => fn !== cb) as any;
  }
}

export default UploadItem;