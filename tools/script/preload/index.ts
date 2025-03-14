// Copyright 2024 MakerYang, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ipcRenderer } from "electron";
import Os from "os";
import Path from "path";
import * as Package from "../../../package.json";
import { Command } from "./command";

(window as any).base = {
    name: Package.name,
    version: Package.version,
    author: Package.author,
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron
    },
    paths: {
        path: Path,
        app: (process: any)=> {
            return Path.join(__dirname, (process.env["VITE_DEV_SERVER_HOST"] !== "::1" ? "./../../../../" : "./../../"));
        },
        roaming: (process: any)=> {
            const path_temp= (Os.platform() === "win32" ? process.env["APPDATA"] + "" : process.env["HOME"] + "");
            return Path.join(path_temp, "./");
        },
        home: (process: any)=> {
            const path_temp= (Os.platform() === "win32" ? (process.env["HOMEDRIVE"]  + "" + process.env["HOMEPATH"]) : process.env["HOME"] + "");
            return Path.join(path_temp, "./");
        },
        temp: (_process: any)=> {
            return Path.join(Os.tmpdir(), "./");
        }
    },
    environment: (process: any) => {
        return process.env["VITE_DEV_SERVER_HOST"] !== "::1" ? "produce" : "develop"
    },
    platform: () => Os.platform(),
    ipc: ipcRenderer,
    process: process,
    command: Command,
    proxy: {
        pac_url: Package.proxy.pac_url,
        file_name: Package.proxy.file_name
    }
}