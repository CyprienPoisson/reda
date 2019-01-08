"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var users = child_process_1.execSync("synouser --enum all")
    .match(/^(.*?)$/gm)
    .slice(1);
console.log(users);
