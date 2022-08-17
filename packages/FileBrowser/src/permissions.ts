import { atom, useAtom } from 'jotai';

export type Permissions = {
  canDownload: boolean,
  canUpload: boolean,
  canUploadFolder: boolean,
  canMkdir: boolean,
  canDelete: boolean,
  canMove: boolean,
  canCopy: boolean,
};

export const grantAllPermissions: Permissions = {
  canDownload: true,
  canUpload: true,
  canUploadFolder: true,
  canMkdir: true,
  canDelete: true,
  canMove: true,
  canCopy: true,
};

export const denyAllPermissions: Permissions = {
  canDownload: false,
  canUpload: false,
  canUploadFolder: false,
  canMkdir: false,
  canDelete: false,
  canMove: false,
  canCopy: false,
};

export const permissionsAtom = atom(grantAllPermissions);

export const usePermissions = (): Permissions => {
  const [permissions] = useAtom(permissionsAtom);
  return permissions;
};