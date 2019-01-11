export interface IUser {
  username: string;
  fullname: string;
  isExpired: boolean;
  email: string;
}

export interface IShare {
  name: string;
  comment: string;
  path: string;
  usesACL: boolean;
  hasRecycleBin: boolean;
  hasSnapshotBrowser: boolean;
  permissions: IPermissions;
}

export interface IPermissions {
  custom: string[];
  none: string[];
  readOnly: string[];
  readWrite: string[];
}
