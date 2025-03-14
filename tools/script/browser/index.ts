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

import * as electron from "electron";
import Store from "electron-store";
import html2canvas from "html2canvas";
import * as Package from "../../../package.json";

const Plugin = {
    base: {
        get_name(): string {
            return Package.name;
        },
        get_version(): string {
            return Package.version;
        },
        get_chrome_version(): string {
            return process.versions.chrome;
        },
        get_node_version(): string {
            return process.versions.node;
        },
        get_electron_version(): string {
            return process.versions.electron;
        }
    },
    electron: {
        ipc: electron.ipcRenderer,
        store: new Store()
    },
    browser: {
        tools: {
            html2canvas: html2canvas
        }
    },
    network: {
        
    },
    interface: {
        
    }
}

electron.ipcRenderer.on("message", (_event: any, _message: any) => {
    
});

electron.contextBridge.exposeInMainWorld("plugins", Plugin);