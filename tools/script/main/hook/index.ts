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

import * as Electron from "electron";

export default class Hook {

    public constructor(main: any) {
        const _this: any = this;
        _this.main = main;
        _this.partition_chrome = false;
        _this.partition_geeker = false;
        console.log("[main:hook:init]");
        _this.InitPartitionChrome();
        _this.InitPartitionGeeker();
    }

    setDetails(details: any){
        details.requestHeaders["sec-ch-ua"] = `"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"`;
        details.requestHeaders["sec-ch-ua-full-version-list"] = `"Google Chrome";v="131.0.6778.109", "Chromium";v="131.0.6778.109", "Not_A Brand";v="24.0.0.0"`;
        details.requestHeaders["sec-ch-ua-arch"] = `"x86"`;
        details.requestHeaders["sec-ch-ua-bitness"] = `"64"`;
        details.requestHeaders["sec-ch-ua-full-version"] = `"131.0.6778.109"`;
        details.requestHeaders["sec-ch-ua-model"] = `""`;
        details.requestHeaders["sec-ch-ua-platform-version"] = `"15.0.0"`;
        // details.requestHeaders["oai-language"] = `"en-US"`;
        return details;
    }

    InitPartitionChrome(){
        const _this: any = this;
        console.log("[main:hook:init:partition:chrome]");
        _this.partition_chrome = Electron.session.fromPartition("persist:chrome");
        _this.partition_chrome.webRequest.onBeforeSendHeaders((details: any, callback: any) =>{
            details = _this.setDetails(details);
            callback({cancel: false, requestHeaders: details.requestHeaders});
        });
    }

    InitPartitionGeeker(){
        const _this: any = this;
        console.log("[main:hook:init:partition:geeker]");
        _this.partition_geeker = Electron.session.fromPartition("persist:geeker");
        _this.partition_geeker.webRequest.onBeforeSendHeaders((details: any, callback: any) =>{
            details = _this.setDetails(details);
            callback({cancel: false, requestHeaders: details.requestHeaders});
        });
        _this.partition_geeker.webRequest.onBeforeRedirect((details: any)=>{
            if (details.redirectURL.startsWith("com.openai.chat://auth0.openai.com/ios/com.openai.chat/callback?")) {
                const code = new URL(details.redirectURL).searchParams.get("code");
                _this.main.webContents.send("message", {type: "main:hook:chatgpt:callback", data: details.redirectURL});
                return {cancel: true};
            }
        }, {urls: ["<all_urls>"]}, ["responseHeaders"]);
        _this.partition_geeker.protocol.handle("com.openai.chat", (_request: any) => {
            return null;
        });
    }
}