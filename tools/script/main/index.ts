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
import ElectronDebug from "electron-debug";
import Store from "electron-store";
import * as Updater from "electron-updater";
import * as FileAPI from "fs";
import os from "os";
import path from "path";
import Package from "../../../package.json";
import AdmZip from "./admzip";
import Hook from "./hook";
import Request from "./request";

const store = new Store();

// Initialize the application window
let Windows: any = {
    Main: false,
    Options: {
        title: Package.build.nsis.shortcutName,
        frame: false,
        center: true,
        width: 1200,
        height: 750,
        minWidth: 1200,
        minHeight: 750,
        useContentSize: false,
        hasShadow: os.platform() === "darwin",
        webPreferences: {
            javascript: true,
            spellcheck: true,
            webviewTag: true,
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: false,
            preload: path.join(__dirname, "../preload/index.cjs")
        },
        fullscreen: false,
        show: false,
        backgroundColor: "#ffffff",
        titleBarStyle: "hidden"
    },
    UserData: {
        Lang: store.get("template:electron:language", ""),
        Display: store.get("template:electron:display", 0),
        Sleep: false,
        Quit: false,
    },
    Hook: false
};

// Prevent the application from opening multiple times
if (!Electron.app.requestSingleInstanceLock()){
    Electron.app.quit();
}else{
    Electron.app.on("second-instance", ()=>{
        if (Windows.Main) {
            Windows.Main.show();
            Windows.Main.setAlwaysOnTop(true);
            Windows.Main.setAlwaysOnTop(false);
        }
    });
}

// Configuration related to environment variables and startup parameters
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
ElectronDebug({showDevTools: false, devToolsMode: "bottom"});
Electron.app.commandLine.appendSwitch("ignore-certificate-errors", "true");
Electron.app.commandLine.appendSwitch("disable-gpu", "false");
Electron.app.commandLine.appendSwitch("enable-unsafe-swiftshader");
if(Windows.UserData.Lang !== ""){
    Electron.app.commandLine.appendSwitch("--lang", Windows.UserData.Lang); // zh-CN or en-US
}else{
    Windows.UserData.Lang = Electron.app.getLocale()
    Electron.app.commandLine.appendSwitch("--lang", Windows.UserData.Lang);
}
// Electron.app.commandLine.appendSwitch("--proxy-pac-url", "https://common.cdn.geekros.com/upload/network/network_geekllm.js?time=" + Math.floor(Date.now() / 1000));

// Initialize the application's root domain and path
const base_url: string = Electron.app.isPackaged ? `file://${path.join(__dirname, "../renderer/index.html")}` : `http://${Package.env.VITE_DEV_SERVER_HOST}:${Package.env.VITE_DEV_SERVER_PORT}`;
let user_agent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 MicroMessenger/1.0.0 Chromium/" + Package.version;
if(os.platform() === "darwin"){
    user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 MicroMessenger/1.0.0 Chromium/" + Package.version;
}

function onWindowMain(){
    console.log("[main:onWindowMain]", Windows.UserData.Lang);

    let display = null;

    if (Windows.UserData.Display > 0) {
        const displays = Electron.screen.getAllDisplays();
        display = displays.find(display => display.id === Windows.UserData.Display);
    }

    if(display){
        const { bounds } = display;
        const window_width = Windows.Options.width;
        const window_height = Windows.Options.height;
        const x = bounds.x + Math.round((bounds.width - window_width) / 2);
        const y = bounds.y + Math.round((bounds.height - window_height) / 2);
        Windows.Options = {...Windows.Options, x, y};
    }

    Windows.Main = new Electron.BrowserWindow(Windows.Options);
    Windows.Main.loadURL(
        base_url + "#/",
        {
            "userAgent": user_agent
        }
    ).then((res: any) => {
        console.log("[main:load]", res, Electron.app.isPackaged);
        if(!Windows.UserData.Quit){
            const tray_development = os.platform() === "darwin" ? "tools/icons/macos.png" : "tools/icons/windows.ico";
            const tray_production = os.platform() === "darwin" ? path.join(__dirname, "../icons/macos.png") : path.join(__dirname, "../icons/windows.ico");
            const tray_icon = Electron.app.isPackaged ? new Electron.Tray(Electron.nativeImage.createFromPath(tray_production)) : new Electron.Tray(Electron.nativeImage.createFromPath(tray_development));
            const tray_menu = Electron.Menu.buildFromTemplate([
                {
                    label: Windows.UserData.Lang === "zh-CN" ? "官方网站" : "Official website",
                    click: function () {
                        Electron.shell.openExternal("https://www.makeryang.com")
                    }
                },
                {
                    label: Windows.UserData.Lang === "zh-CN" ? ("版本：" + Package.version) : ("Version: " + Package.version),
                    click: function () {}
                },
                {
                    label: Windows.UserData.Lang === "zh-CN" ? "退出软件" : "Exit",
                    click: function () {
                        Windows.UserData.Quit = true;
                        Windows.Main.close();
                        Electron.app.quit();
                    }
                }
            ]);
            tray_icon.setContextMenu(tray_menu);
            tray_icon.setToolTip(Package.title);
            // tray_icon.setTitle(Package.title);
            tray_icon.on("click",function(_event: any){});
            tray_icon.on("double-click", function () {
                Windows.Main.show();
            });   
        }
    });

    Windows.Main.on("ready-to-show", function () {
        Windows.Main.show();
        Windows.Main.webContents.send("message", {type: "main:user:agent", data: user_agent});
    });

    Windows.Main.on("moved", () => {
        console.log("[main:moved]");
        DisplayEvent();
    });

    Windows.Main.on("close", (event: any) => {
        if(!Windows.UserData.Quit){
            Windows.Main.hide();
            event.preventDefault();
        }
    });

    // Implement right-click menu
    Windows.Main.webContents.on("context-menu", (e: any, _params: any) => {
        e.preventDefault();
    });

    Electron.globalShortcut.register("F11", () => {
        console.log("[main:global:shortcut]", "F11");
    });

    Electron.globalShortcut.register("Shift+Alt+L", () => {
        console.log("[main:global:shortcut]", "L");
        store.set("template:electron:language", "");
        if(Windows.UserData.Lang === ""){
            store.set("template:electron:language", "en-US");
        }
        if(Windows.UserData.Lang !== ""){
            if(Windows.UserData.Lang === "en-US"){
                store.set("template:electron:language", "zh-CN");
            }
            if(Windows.UserData.Lang === "zh-CN"){
                store.set("template:electron:language", "en-US");
            }
        }
    });

    Electron.globalShortcut.register("Shift+Alt+P", () => {
        console.log("[main:global:shortcut]", "P");
    });

    Electron.globalShortcut.register("Shift+Alt+H", () => {
        console.log("[main:global:shortcut]", "H");
        Windows.Main.webContents.openDevTools({mode: "bottom", activate: false});
    });

    Electron.globalShortcut.register("Shift+Alt+V", () => {
        console.log("[main:global:shortcut]", "V");
        Windows.Main.webContents.send("message", {type: "main:browser:tools"});
    });

    Electron.globalShortcut.register("Shift+Alt+C", () => {
        console.log("[main:global:shortcut]", "C");
        Electron.session.defaultSession.clearCache().then(()=>{
            Electron.session.defaultSession.clearStorageData({
                storages: ["cookies", "indexdb", "websql", "filesystem", "shadercache", "websql", "serviceworkers", "cachestorage"]
            }).then(()=>{
                console.log("[main:clear:cache:then]");
                Windows.Main.webContents.send("message", {type: "main:clear:cache"});
            }).catch((e: any)=>{
                console.log("[main:clear:cache:catch]", e);
                Windows.Main.webContents.send("message", {type: "main:clear:cache"});
            });
        }).catch(()=>{
            Windows.Main.webContents.send("message", {type: "main:clear:cache"});
        });
    });

    Electron.globalShortcut.register("Shift+Alt+S", () => {
        console.log("[main:global:shortcut]", "S");
        Windows.Main.webContents.send("message", {type: "main:display:sleep", status: !Windows.UserData.Sleep});
    });

    DisplayEvent();

    UpdaterEvent();
}

// When the application is ready
Electron.app.on("ready", () => {
    console.log("[main:ready]");
    InitUnpacked();
});

// When the application is ready
Electron.app.whenReady().then(() => {
    console.log("[main:whenready]");
    // Set app global useragent
    Electron.app.userAgentFallback = user_agent;
    onWindowMain();
    // Switch the sleep configuration once to ensure the status is not 0
    Windows.UserData.Sleep = Electron.powerSaveBlocker.start("prevent-display-sleep");
    Electron.powerSaveBlocker.stop(Windows.UserData.Sleep);
    Windows.UserData.Sleep = false;
    // Active state monitoring
    Electron.app.on("activate", () => {
        console.log("[main:activate]");
        if (Electron.BrowserWindow.getAllWindows().length === 0){
            console.log("[main:activate:length]", 0);
            onWindowMain();
        }
    });
    // Request Listening and Interception Handling
    Windows.Hook = new Hook(Windows.Main);
    // listens for power suspend and screen lock
    Electron.powerMonitor.on("suspend", () => {
        console.log("[main:powerMonitor:suspend]");
        if (Windows.Main) {
            Windows.Main.webContents.send("message", {type: "main:power:lock"});
        }
    });
    Electron.powerMonitor.on("resume", () => {
        console.log("[main:powerMonitor:resume]");
        if (Windows.Main) {
            Windows.Main.webContents.send("message", {type: "main:power:unlock"});
        }
    });
    Electron.powerMonitor.on("lock-screen", () => {
        console.log("[main:powerMonitor:lock-screen]");
        if (Windows.Main) {
            Windows.Main.webContents.send("message", {type: "main:screen:lock"});
        }
    });
    Electron.powerMonitor.on("unlock-screen", () => {
        console.log("[main:powerMonitor:unlock-screen]");
        if (Windows.Main) {
            Windows.Main.webContents.send("message", {type: "main:screen:unlock"});
        }
    });
});

Electron.ipcMain.on("browser", (_event: any, args: any) => {
    if(args.type === "template:geeker:chatgpt:account"){
        Windows.Main.webContents.send("message", {type: "main:geeker:chatgpt:account", data: args.data});
    }
    if(args.type === "template:geeker:chatgpt:session"){
        Windows.Main.webContents.send("message", {type: "main:geeker:chatgpt:session", data: args.data});
    }
    if(args.type === "template:geeker:chatgpt:login"){
        Windows.Main.webContents.send("message", {type: "main:geeker:chatgpt:login", data: args.data});
    }
});

// Listen for main process messages
Electron.ipcMain.on("message", (event: any, args: any) => {
    if(args.type === "template:select:folder:path"){
        if(args.callback && args.callback === "local_path"){
            Electron.dialog.showOpenDialog(Windows.Main, {
                properties: ["openDirectory"]
            }).then((r: any) => {
                event.sender.send("message", {type: "select_folder_path", callback: args.callback, data: r});
            });
        }
    }
    if(args.type === "template:header:right:button"){
        if(args.data === "close"){
            if(!Windows.UserData.Quit){
                Windows.Main.hide();
            }else{
                Windows.Main.close();
                Electron.app.quit();
            }
        }
        if(args.data === "min"){
            Windows.Main.minimize();
        }
        if(args.data === "size"){
            if(Windows.Main.isMaximized()){
                Windows.Main.unmaximize();
            }else{
                Windows.Main.maximize();
            }
        }
    }
    if(args.type === "template:window:resize"){
        if(args.data === "resize"){
            if(Windows.Main.isMaximized()){
                event.sender.send("message", {type: "main:window:resize", data: "max"});
            }else{
                event.sender.send("message", {type: "main:window:resize", data: "restore"});
            }
        }
    }
    if(args.type === "template:cache:clear"){
        Electron.session.defaultSession.clearCache().then(()=>{
            Electron.session.defaultSession.clearStorageData({
                storages: ["cookies", "indexdb", "websql", "filesystem", "shadercache", "websql", "serviceworkers", "cachestorage"]
            }).then(()=>{
                event.sender.send("message", {type: "main:cache:clear"});
            }).catch((_e: any)=>{
                event.sender.send("message", {type: "main:cache:clear"});
            });
        }).catch(()=>{
            event.sender.send("message", {type: "main:cache:clear"});
        });
    }
    if(args.type === "template:refresh:account:data"){
        event.sender.send("message", {type: "main:refresh:account:data"});
    }
    if(args.type === "template:docker:set:proxy"){
        Electron.session.defaultSession.clearAuthCache().then(() => {
            Electron.session.defaultSession.setProxy({pacScript: ""}).then(() => {
                Electron.session.defaultSession.setProxy({
                    pacScript: args.data + "?time=" + Math.floor(Date.now() / 1000)
                }).then((_e: any)=>{
                    console.log("[main:docker:set:proxy:then]");
                    Windows.Main.webContents.send("message", {type: "main:user:agent", data: user_agent});
                }).catch((e: any)=>{
                    console.log("[main:docker:set:proxy:catch]", e);
                });
            }).catch((e: any)=>{
                console.log("[main:docker:set:proxy:catch]", e);
            });
        });
    }
    if(args.type === "template:docker:reset"){
        console.log("[main:docker:reset]");
        Electron.session.defaultSession.clearAuthCache().then(() => {
            Electron.session.defaultSession.setProxy({pacScript: ""}).then(() => {
                StopDocker();
                setTimeout(()=>{
                    InitUnpacked();
                    event.sender.send("message", {type: "main::docker:reset"});
                }, 2000);
            });
        });
    }
    if(args.type === "template:docker:restart"){
        console.log("[main:docker:restart]");
        Electron.session.defaultSession.clearAuthCache().then(() => {
            Electron.session.defaultSession.setProxy({pacScript: ""}).then(() => {
                StopDocker();
                setTimeout(()=>{
                    event.sender.send("message", {type: "main::docker:restart"});
                }, 2000);
            });
        });
    }
    if(args.type === "template:docker:stop"){
        console.log("[main:docker:stop]");
        Electron.session.defaultSession.clearAuthCache().then(() => {
            Electron.session.defaultSession.setProxy({pacScript: ""}).then(() => {
                StopDocker();
            });
        });
    }
    if(args.type === "template:display:sleep"){
        if(args.status){
            Windows.UserData.Sleep = Electron.powerSaveBlocker.start("prevent-display-sleep");
        }else{
            if(Windows.UserData.Sleep){
                Electron.powerSaveBlocker.stop(Windows.UserData.Sleep);
                Windows.UserData.Sleep = false;
            }
        }
        console.log("[main:display:sleep]", Windows.UserData.Sleep);
    }
    if(args.type === "template:updater:app"){
        console.log("[main:updater:app]", args.data);
        if(Electron.app.isPackaged){
            let updater_app_path = path.resolve(__dirname, "../../../../");
            let updater_app_download_length = 0;
            let updater_app_download_received = 0;
            let updater_app_file = FileAPI.createWriteStream(updater_app_path + "/updater_app.zip");
            let updater_app_download = new Request().getApi({
                method: "GET",
                uri: "https://common.cdn.makeryang.com/updater/geekllm/" + args.data + "/" + os.platform() + ".zip",
                headers: {
                    "Referer": "https://desktop.makeryang.com",
                    "User-Agent": user_agent
                }
            });
            updater_app_download.pipe(updater_app_file);
            updater_app_download.on("response", function (data: any) {
                updater_app_download_length = data.headers["content-length"];
            });
            updater_app_download.on("data", function (chunk: any) {
                updater_app_download_received += chunk.length;
                event.sender.send("message", {type: "main:updater:app:progress", data: parseFloat(((updater_app_download_received * 100) / updater_app_download_length).toFixed(2))});
            });
            updater_app_download.on("end", function () {
                event.sender.send("message", {type: "main:updater:app:end", data: false});
                setTimeout(()=>{
                    const zip = new AdmZip().getApi(updater_app_path + "/updater_app.zip");
                    zip.extractAllTo(updater_app_path, true);
                    setTimeout(()=>{
                        FileAPI.unlinkSync(updater_app_path + "/updater_app.zip");
                        ReplaceAsar();
                        Windows.UserData.Quit = true;
                        Windows.Main.close();
                        Electron.app.relaunch();
                        Electron.app.quit();
                    }, 1000);
                }, 1000);
            });
        }
    }
    if(args.type === "template:updater"){
        console.log("[main:updater]");
        Updater.autoUpdater.checkForUpdates().then((_r: any)=> {
            if(!Electron.app.isPackaged){
                Windows.Main.webContents.send("message", {
                    type: "main:updater:update:not:available"
                });
            }
        });
    }
    if(args.type === "template:quit"){
        console.log("[main:quit]");
        Windows.UserData.Quit = true;
        Windows.Main.close();
        Electron.app.quit();
    }
});

function InitUnpacked(){
    console.log("[main:init:unpacked]");
    // Copy Pack Files
    FileAPI.mkdirSync(path.join(__dirname, Electron.app.isPackaged ? "../../../../unpacked" : "../../unpacked"), {recursive: true});
    const net_files = FileAPI.readdirSync(path.join(__dirname, "../pack"), {withFileTypes: true});
    for (let item of net_files) {
        if (item.name !== ".gitkeep") {
            let srcPath = path.join(path.join(__dirname, "../pack/"), item.name);
            let destPath = path.join(path.join(__dirname, Electron.app.isPackaged ? "../../../../unpacked/" : "../../unpacked/"), item.name);
            FileAPI.copyFileSync(srcPath, destPath);
        }
    }
    const child_process = require("child_process");
    if(os.platform() !== "win32"){
        child_process.spawn("chmod", ["-R", "777", path.join(__dirname, Electron.app.isPackaged ? "../../../../unpacked/" : "../../unpacked/")]);
    }
}

function StopDocker(){
    const child_process = require("child_process");
    if(os.platform() === "win32") {
        child_process.spawn("TASKKILL", ["/IM", "LLMService.exe", "/F"]);
    }
    if(os.platform() === "darwin") {
        child_process.spawn("killall", ["LLMService"]);
    }
}

function ReplaceAsar(){
    console.log("[main:replace:asar]");
    const {execSync, spawnSync} = require("child_process");
    const updater_app_path = path.resolve(__dirname, "../../../../");
    const asarPath = path.join(updater_app_path, "/app.asar");
    const updaterAsarPath = path.join(updater_app_path, "/app.temp");
    if (FileAPI.existsSync(updaterAsarPath)) {
        if(os.platform() === "win32"){
            function checkWritePermission(folderPath: any) {
                try {
                    const testFile = path.join(folderPath, ".test");
                    FileAPI.writeFileSync(testFile, "test");
                    FileAPI.unlinkSync(testFile);
                    return true;
                } catch (error) {
                    return false;
                }
            }
            if (!checkWritePermission(updater_app_path)) {
                const args: any = [
                    "-FilePath",
                    "cmd",
                    "-WindowStyle",
                    "hidden",
                    "-ArgumentList",
                    `"/c xcopy \\"${updaterAsarPath}\\" \\"${asarPath}\\" /y"`,
                    "-Verb",
                    "RunAs",
                ];
                spawnSync("powershell", args, { stdio: "ignore" });
            }else{
                const cmd = `xcopy "${updaterAsarPath}" "${asarPath}" /y`;
                execSync(cmd, {stdio: "ignore"});
            }
        }else{
            const cmd = `cp -r -f "${updaterAsarPath}" "${asarPath}"`;
            execSync(cmd, {stdio: "ignore"});
        }
        FileAPI.unlinkSync(updater_app_path + "/app.temp");
    }
}

function DisplayEvent(){
    const bounds: any = Windows.Main.getBounds();
    const display = Electron.screen.getDisplayNearestPoint({
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
    });

    store.set("geekmll:electron:display", display.id);
}

function UpdaterEvent(){
    
    console.log("[main:updater:event]");

    Updater.autoUpdater.setFeedURL(Package.build.publish[0].url);

    Updater.autoUpdater.on("error", function (error: any) {
        Windows.Main.webContents.send("message", {
            type: "main:updater:error",
            error: error
        });
    });

    Updater.autoUpdater.on("checking-for-update", function () {
        Windows.Main.webContents.send("message", {
            type: "main:updater:checking:for:update"
        });
    });

    Updater.autoUpdater.on("update-available", function (_info: any) {
        Windows.Main.webContents.send("message", {
            type: "main:updater:update:available"
        });
    });

    Updater.autoUpdater.on("update-not-available", function (_info: any) {
        Windows.Main.webContents.send("message", {
            type: "main:updater:update:not:available"
        });
    });

    Updater.autoUpdater.on("download-progress", function (progress: any) {
        Windows.Main.webContents.send("message", {
            type: "main:updater:download:progress",
            progress: progress
        });
    });

    Updater.autoUpdater.on("update-downloaded", function () {
        Windows.Main.webContents.send("message", {
            cmd: "main:updater:update:downloaded"
        });
        Windows.UserData.Quit = true;
        Updater.autoUpdater.quitAndInstall();
    });
}