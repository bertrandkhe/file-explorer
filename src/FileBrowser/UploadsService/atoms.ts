import { UsbOff } from '@mui/icons-material';
import { atom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import UploadItem, { Status } from './UploadItem';

export type QueueAction = {
  type: 'addFileList',
  fileList: File[] | FileList,
  directory: string,
} | {
  type: 'remove',
  id: string,
} | {
  type: 'add',
  upload: UploadItem,
} | {
  type: 'addMultiple',
  uploads: UploadItem[],
} | {
  type: 'replace',
  upload: UploadItem,
};

const queueReducer = (
  value: UploadItem[], 
  action: QueueAction,
) => {
  if (!action) {
    return value;
  }
  switch (action.type) {
    case 'addFileList': {
      return [
        ...value,
        ...Array.from(action.fileList).map((file) => (
          new UploadItem(file, action.directory)
        )),
      ];
    }

    case 'remove':
      return value.filter((upload) => upload.id !== action.id);

    case 'add':
      return [
        ...value,
        action.upload,
      ];

    case 'addMultiple':
      return [
        ...value,
        ...action.uploads,
      ];

    default:
      throw new Error('Unsupported action type');
  }
};

export const waitListAtom = atomWithReducer<UploadItem[], QueueAction>([], queueReducer);
export const inProgressListAtom = atomWithReducer<UploadItem[], QueueAction>([], queueReducer);
export const uploadListAtom = atomWithReducer<UploadItem[], QueueAction>([], queueReducer);
export const stoppedListAtom = atomWithReducer<UploadItem[], QueueAction>([], queueReducer);
export const doneListAtom = atomWithReducer<UploadItem[], QueueAction>([], queueReducer);

export const queueFilesForUploadAtom = atom(null,
  (get, set, value: { fileList: File[] | FileList, directory: string }) => {
    const fileList = (() => {
      return Array.from(value.fileList);
    })();
    const fileQueue = get(uploadListAtom);
    set(uploadListAtom, {
      type: 'addFileList',
      fileList,
      directory: value.directory,
    });
    const newFileQueue = get(uploadListAtom);
    const newUploads = newFileQueue.slice(fileQueue.length, newFileQueue.length);
    set(waitListAtom, {
      type: 'addMultiple',
      uploads: newUploads,
    });
  }
);

export const closeUploadItemAtom = atom(
  null,
  (get, set, upload: UploadItem) => {
    switch (upload.getStatus()) {
      case Status.ON_HOLD:
        set(waitListAtom, {
          type: 'remove',
          id: upload.id,
        });
        break;

      case Status.DONE:
        set(doneListAtom, {
          type: 'remove',
          id: upload.id,
        });
        break;

      case Status.STOPPED:
        set(stoppedListAtom, {
          type: 'remove',
          id: upload.id,
        });
        break;

      case Status.IN_PROGRESS:
        throw new Error('Cannot close UploadItem while it is running.');
    }
    upload.setStatus(Status.STOPPED);
    set(uploadListAtom, { type: 'remove', id: upload.id });
  },
);

export const startUploadAtom = atom(
  null,
  (get, set, upload: UploadItem) => {
    switch (upload.getStatus()) {
      case Status.IN_PROGRESS:
      case Status.DONE:  
        throw new Error('Fail to start UploadItem');

      case Status.ON_HOLD:
      case Status.FAILED:
      case Status.STOPPED:
        if (
          upload.is(Status.FAILED)
          || upload.is(Status.STOPPED)
        ) {
          set(stoppedListAtom, {
            type: 'remove',
            id: upload.id,
          });
        }
        if (upload.is(Status.ON_HOLD)) {
          set(waitListAtom, {
            type: 'remove',
            id: upload.id,
          });
        }
        upload.setStatus(Status.IN_PROGRESS);
        set(inProgressListAtom, {
          type: 'add',
          upload,
        });
        break;
    }
  },
);

export const stopUploadAtom = atom(
  null,
  (get, set, upload: UploadItem) => {
    switch (upload.getStatus()) {
      case Status.STOPPED:
      case Status.DONE:  
        throw new Error('Fail to stop UploadItem');

      case Status.IN_PROGRESS:
      case Status.ON_HOLD:
        if (upload.isOnHold()) {
          set(waitListAtom, {
            type: 'remove',
            id: upload.id,
          });
        }
        if (upload.isInProgress()) {
          set(inProgressListAtom, {
            type: 'remove',
            id: upload.id,
          });
        }
        upload.setStatus(Status.STOPPED);
        set(stoppedListAtom, {
          type: 'add',
          upload,
        });
        break;
    }
  },
);

export const finalizeUploadAtom = atom(
  null,
  (get, set, upload: UploadItem) => {
    switch (upload.getStatus()) {
      case Status.ON_HOLD:
      case Status.STOPPED:
      case Status.DONE:  
        throw new Error('Fail to finalize UploadItem');

      case Status.IN_PROGRESS:
        set(inProgressListAtom, {
          type: 'remove',
          id: upload.id,
        });
        upload.setStatus(Status.DONE);
        set(doneListAtom, {
          type: 'add',
          upload,
        });
        break;
    }
  },
);

export const failUploadAtom = atom(
  null,
  (get, set, value: { upload: UploadItem, error: unknown }) => {
    const { upload, error } = value;
    switch (upload.getStatus()) {
      case Status.ON_HOLD:
      case Status.STOPPED:
      case Status.DONE:  
        throw new Error('Fail to finalize UploadItem');

      case Status.IN_PROGRESS:
        set(inProgressListAtom, {
          type: 'remove',
          id: upload.id,
        });
        upload.setStatus(Status.FAILED, error);
        set(stoppedListAtom, {
          type: 'add',
          upload,
        });
        break;
    }
  }
);