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

import chalk from "chalk";
import { spawn } from "child_process";
import electron from "electron";
import file from "fs";
import path from "path";
import { build, createServer } from "vite";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

let server;

const argvs = yargs(hideBin(process.argv)).argv;

const modes = ["browser", "desktop"];

const scripts = ["dev", "build"];

if (!argvs.mode || argvs.mode === "" || !modes.includes(argvs.mode)) {
    console.log(chalk.red("Please specify mode: --mode=<browser|desktop>"));
    process.exit(0);
}

if (!scripts.includes(process.env.SCRIPT_MODE)) {
    console.log(chalk.red("Please specify script: <dev|build>"));
    process.exit(0);
}

function onIndex(index_path){
    const index = file.readFileSync(index_path, {encoding: "utf8"});
    const new_index = index.replace(/.\/monacoeditorwork/g, '"monacoeditorwork');
    file.writeFileSync(index_path, new_index);
}

function onIcons(){
    const icons = file.readdirSync("tools/icons", {withFileTypes: true});
    file.mkdirSync("release/dist/icons", {recursive: true});
    for (let item of icons) {
        let srcPath = path.join("tools/icons", item.name);
        let destPath = path.join("release/dist/icons", item.name);
        file.copyFileSync(srcPath, destPath);
    }
}

function onPack(){
    file.mkdirSync("release/dist/pack", {recursive: true});
    const nets = file.readdirSync("tools/pack", {withFileTypes: true});
    for (let item of nets) {
        let srcPath = path.join("tools/pack", item.name);
        let destPath = path.join("release/dist/pack", item.name);
        file.copyFileSync(srcPath, destPath);
    }
}

function onElectronMain(server){
    const address = server.httpServer.address();
    const env = Object.assign(process.env, {
        VITE_DEV_SERVER_HOST: address.address,
        VITE_DEV_SERVER_PORT: address.port,
    });
    return build({
        configFile: "tools/script/main/vite.config.ts",
        mode: "development",
        plugins: [{
            name: "electron-main-watcher",
            writeBundle(command, options) {
                if (process.electronApp) {
                    process.electronApp.removeAllListeners()
                    process.electronApp.kill()
                }
                process.electronApp = spawn(electron, [".", "--no-sandbox"], {stdio: "inherit", env})
                process.electronApp.once("exit", process.exit)
            },
        }],
        build: {
            watch: {},
        },
    })
}

function onElectronPreload(server){
    return build({
        configFile: "tools/script/preload/vite.config.ts",
        mode: "development",
        plugins: [{
            name: "electron-preload-watcher",
            writeBundle() {
                server.ws.send({type: "full-reload"})
            }
        }],
        build: {
            watch: {},
        },
    })
}

async function onViteServer(is_desktop){
    server = await createServer({configFile: "renderer/vite.config.ts"});
    server.listen().then(() => {

        if(is_desktop){
            onElectronPreload(server);
            onElectronMain(server);
        }

        const address = server.httpServer.address();
        if (address && typeof address !== 'string') {
            const host = (address.address === '0.0.0.0' || address.address === '::1') ? 'localhost' : address.address;
            const port = address.port;
            console.log(chalk.green("-----------------------------------------------"));
            console.log(chalk.gray("Current mode"), chalk.green(argvs.mode));
            console.log(chalk.gray("Server running at"), chalk.green(`http://${host}:${port}`));
            console.log(chalk.green("-----------------------------------------------"));
        }
    });
}

if (!file.existsSync("release")) {
    file.mkdirSync("release");
}

file.writeFileSync("release/.gitkeep", "");

if (argvs.mode === "desktop") {

    await build({configFile: "tools/script/main/vite.config.ts"});

    await build({configFile: "tools/script/preload/vite.config.ts"});

    await build({configFile: "renderer/vite.config.ts"});

    onIndex("release/dist/renderer/index.html");

    onIcons();

    onPack();

    if (process.env.SCRIPT_MODE === "dev") {
        onViteServer(true);
    }
}

if (argvs.mode === "browser") {

    if (process.env.SCRIPT_MODE === "dev") {
        onViteServer(false);
    }

    if (process.env.SCRIPT_MODE === "build") {
        await build({configFile: "renderer/vite.config.ts", build: {outDir: "../release/"}});
        onIndex("release/index.html");
    }
}