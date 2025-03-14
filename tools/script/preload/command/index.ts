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

export const Command = {
    api: require("child_process"),
    shell: (command: any, success: any, onerror: any, stderr: any, stdout: any, close: any) => {
        const child_process = require("child_process");
        const spawn: any = child_process.spawn(command.path, command.args, command.options ? command.options : {});
        if(typeof success == "function"){
            success(spawn);
        }
        spawn.on("error", (err: any) => {
            if(typeof onerror == "function"){
                onerror(err);
            }
        });
        spawn.stderr.on("data", (data: any) => {
            if(typeof stderr == "function"){
                stderr(data);
            }
        });
        spawn.stdout.on("data", (data: any) => {
            if(typeof stdout == "function"){
                stdout(data);
            }
        });
        spawn.on("close", (code: any) => {
            if(typeof close == "function"){
                close(code);
            }
        });
    },
    shells: (commands: any, callback: any)=>{
        return new Promise((resolve: any, reject: any)=> {
            let command_index = 0;
            const NextCommand = () => {
                if (command_index >= commands.length) {
                    return resolve();
                }
                const item = commands[command_index];
                Command.shell(item, (spawn: any)=>{
                    callback({type: "spawn", data: spawn, index: command_index});
                }, (error: any)=>{
                    callback({type: "error", data: error.toString(), index: command_index});
                    reject(false);
                }, (stderr: any)=>{
                    callback({type: "stderr", data: stderr.toString(), index: command_index});
                    reject(false);
                }, (stdout: any)=>{
                    callback({type: "stdout", data: stdout.toString(), index: command_index});
                }, (code: any)=>{
                    callback({type: "code", data: code, index: command_index});
                    if(code !== 0){
                        reject(false);
                    }else{
                        command_index++;
                        NextCommand();
                    }
                });
            }
        });
    }
}