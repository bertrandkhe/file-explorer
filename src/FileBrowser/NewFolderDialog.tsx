import React from 'react';
import { useQueryClient } from 'react-query';
import { atom, useAtom } from 'jotai';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { fileBrowser } from './fileBrowser';
import { cwdAtom } from './FileBrowser.atoms';

export const newFolderDialogVisibleAtom = atom(false);

const NewFolderDialog: React.FC = () => {
  const [cwd] = useAtom(cwdAtom);
  const [visible, setVisible] = useAtom(newFolderDialogVisibleAtom);
  const closeFolderDialog = () => setVisible(false);
  const invalidateQueries = fileBrowser.useInvalidateQueries();

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
    createFolderMutation.mutate({ key });
  };

  return (
    <Dialog
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