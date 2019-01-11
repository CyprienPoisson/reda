import { execSync } from "child_process";
import { IShare, IShareList, ISynoData, IUser, IUserList } from "./interfaces";

function getField(source: string, fieldname: string) {
  const rx = `^.*${fieldname}.*\\[(.*)\\]$`;
  const matcher = new RegExp(rx, "m");
  const result = source.match(matcher);
  if (result !== null) {
    return result[1];
  } else {
    console.log(source);
    throw new Error(`Bad field name: ${fieldname}`);
  }
}

function parseACL(list: string, data: ISynoData) {
  return list.split(",").filter((username) => {
    return (
      typeof username === "string" &&
      username.length > 0 &&
      data.users[username] !== undefined
    );
  });
}

function getUser(username: string): IUser {
  const user = execSync(`synouser --get '${username}'`, {
    encoding: "utf8",
  });

  return {
    email: getField(user, "User Mail"),
    fullname: getField(user, "Fullname"),
    isExpired: getField(user, "Expired") !== "false",
    username: getField(user, "User Name"),
  };
}

function getUsers(data: ISynoData): void {
  const users = execSync("synouser --enum all", {
    encoding: "utf8",
  }).match(/^(.+)$/gm);

  if (users === null) {
    return;
  }

  do {
    const current = users.shift();
    if (
      current === undefined ||
      current.match(/[0-9]+ User Listed:/g) !== null
    ) {
      break;
    }
  } while (true);

  data.users = users.reduce((list: IUserList, username: string) => {
    const user = getUser(username);
    if (username === "admin" || username === "guest" || user.isExpired) {
      return list;
    }

    list[username] = user;
    return list;
  }, {});
}

function getShares(data: ISynoData): void {
  const shares = execSync("synoshare --enum local", {
    encoding: "utf8",
  }).match(/^(.+)$/gm);

  if (shares === null) {
    return;
  }

  do {
    const current = shares.shift();
    if (current === undefined || current.match(/[0-9]+ Listed:/g) !== null) {
      break;
    }
  } while (true);

  data.shares = shares.reduce((list: IShareList, shareName: string) => {
    list[shareName] = getShare(shareName, data);
    return list;
  }, {});
}

function getShare(sharename: string, data: ISynoData): IShare {
  const share: string = execSync(`synoshare --get '${sharename}'`, {
    encoding: "utf8",
  });

  const acls: string = execSync(`synoshare --list_acl '${sharename}'`, {
    encoding: "utf8",
  });

  return {
    comment: getField(share, "Comment"),
    hasRecycleBin: getField(share, "RecycleBin") === "yes",
    hasSnapshotBrowser: getField(share, "Snapshot browsing") === "yes",
    name: getField(share, "Name"),
    path: getField(share, "Path"),
    permissions: {
      custom: parseACL(getField(acls, "ACL Custom List"), data),
      none: parseACL(getField(acls, "ACL NA List"), data),
      readOnly: parseACL(getField(acls, "ACL RO List"), data),
      readWrite: parseACL(getField(acls, "ACL RW List"), data),
    },
    usesACL: getField(share, "ACL") === "yes",
  };
}

export default function getSynoData(): ISynoData {
  const data = {
    shares: {},
    users: {},
  };

  getUsers(data);
  getShares(data);
  return data;
}
