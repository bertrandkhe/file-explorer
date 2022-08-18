import React, { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { fileBrowser, useFileBrowserContext } from './fileBrowser';
import { cwdAtom } from './FileBrowser.atoms';
import { folderListAtom } from './FileList/atoms';

export const newFolderDialogVisibleAtom = atom(false);

const NewFolderDialog: React.FC = () => {
  const [cwd] = useAtom(cwdAtom);
  const [folderList] = useAtom(folderListAtom);
  const [errors, setErrors] = useState<{
    folderName: string,
  }>({
    folderName: '',
  });
  const existingKeys = folderList.map((f) => f.prefix);
  const [visible, setVisible] = useAtom(newFolderDialogVisibleAtom);
  const closeFolderDialog = () => setVisible(false);
  const invalidateQueries = fileBrowser.useInvalidateQueries();
  const { portalContainer } = useFileBrowserContext();

  const createFolderMutation = fileBrowser.useMutation(['mkdir'], {
    onSuccess() {
      invalidateQueries(['ls', {
        prefix: cwd.slice(1),
      }]);
      closeFolderDialog();
    }
  });
  const handleCreateNewFolder: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const folderName = formData.get('folderName') as string;
    const key = `${cwd}${folderName}/`.replace(/^(\/)+/, '');
    if (existingKeys.includes(key)) {
      setErrors({
        folderName: `Folder "${folderName}" already exists.`,
      });
      return;
    }
    createFolderMutation.mutate({ key });
  };

  useEffect(() => {
    return () => {
      setErrors({ folderName: '' });
    };
  }, [visible]);

  return (
    <Dialog
      container={portalContainer}
      open={visible}
      onClose={() => setVisible(false)}
      TransitionProps={{
        onEntered(node) {
          const firstInput = node.querySelector('input');
          if (!firstInput) {
            return;
          }
          firstInput.focus();
        }
      }}
    >
      <DialogTitle>
        Create new folder
      </DialogTitle>
      <form onSubmit={handleCreateNewFolder}>
        <DialogContent>
          <TextField
            name="folderName"
            label="New folder name"
            placeholder="Input the folder name"
            error={errors.folderName.length > 0}
            helperText={errors.folderName}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button 
            disabled={createFolderMutation.isLoading}
            color="error"
            onClick={closeFolderDialog}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            disabled={createFolderMutation.isLoading}
            type="submit"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewFolderDialog;