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

export interface IUserList {
  [index: string]: IUser;
}

export interface IShareList {
  [index: string]: IShare;
}

export interface ISynoData {
  users: IUserList;
  shares: IShareList;
}
