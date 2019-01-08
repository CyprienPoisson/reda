import { execSync } from "child_process";

const users = execSync("synouser --enum all")
  .match(/^(.*?)$/gm)
  .slice(1);
console.log(users);
