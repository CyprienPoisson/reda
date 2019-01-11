import { execSync } from "child_process";
import { IShare, IUser } from "./interfaces";

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

function parseACL(list: string) {
  return list.split(",").filter((i) => {
    return (
      typeof i === "string" &&
      i.length > 0 &&
      i !== "@administrators" &&
      i !== "admin"
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

function getUsers(): any {
  const users = execSync("synouser --enum all", {
    encoding: "utf8",
  }).match(/^(.+)$/gm);

  if (users === null) {
    return {};
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

  return users.reduce((s: any, i: string) => {
    if (i === "admin" || i === "guest") {
      return s;
    }
    s[i] = getUser(i);
    return s;
  }, {});
}

function getShares(): any {
  const shares = execSync("synoshare --enum local", {
    encoding: "utf8",
  }).match(/^(.+)$/gm);

  if (shares === null) {
    return {};
  }

  do {
    const current = shares.shift();
    if (current === undefined || current.match(/[0-9]+ Listed:/g) !== null) {
      break;
    }
  } while (true);

  return shares.reduce((s: any, i: string) => {
    s[i] = getShare(i);
    return s;
  }, {});
}

function getShare(sharename: string): IShare {
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
      custom: parseACL(getField(acls, "ACL Custom List")),
      none: parseACL(getField(acls, "ACL NA List")),
      readOnly: parseACL(getField(acls, "ACL RO List")),
      readWrite: parseACL(getField(acls, "ACL RW List")),
    },
    usesACL: getField(share, "ACL") === "yes",
  };
}

export default function getSynoData() {
  return {
    shares: getShares(),
    users: getUsers(),
  };
}
