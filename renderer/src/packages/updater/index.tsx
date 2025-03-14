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

import { useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../base/alert-dialog";
import { Progress } from "../base/progress";

export default function Updater({ data, updateData }: any) {

    useEffect(() => {
        (window as any).base.ipc.send("message", {type: "template:updater", data: false});
        (window as any).base.ipc.on("message", (_event: any, message: any) => {
            // Updater asar file
            if (message.type === "main:updater:app:progress") {
                data.updater.status = true;
                data.updater.progress.value = message.data;
                data.updater.progress.error = "";
                updateData(data);
            }
            if (message.type === "main:updater:app:end") {
                data.updater.status = true;
                data.updater.progress.value = 100;
                data.updater.progress.error = "";
                updateData(data);
            }
            // Updater app file
            if (message.type === "main:updater:update:not:available") {
                data.updater.status = false;
                data.updater.progress.value = 0;
                data.updater.progress.error = "";
                updateData(data);
            }
            if (message.type === "main:updater:update:available") {
                data.updater.status = true;
                data.updater.progress.value = 0;
                data.updater.progress.error = "";
                updateData(data);
            }
            if (message.type === "main:updater:download:progress") {
                data.updater.status = true;
                data.updater.progress.value = Math.round(parseFloat(message.progress.percent));
                data.updater.progress.error = "";
                updateData(data);
            }
            if (message.type === "main:updater:update:downloaded") {
                data.updater.status = true;
                data.updater.progress.value = 100;
                data.updater.progress.error = "";
                updateData(data);
            }
            if (message.type === "main:updater:error") {
                data.updater.status = true;
                data.updater.progress.value = 100;
                data.updater.progress.error = message.error;
                updateData(data);
            }
        });
    }, []);

    return (
        <AlertDialog open={data.updater.status}>
            <AlertDialogContent className="w-[420px] z-[80000]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-[18px]">新版本升级</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm py-5">
                        <Progress value={data.updater.progress.value} className="w-[80%] mx-auto" />
                        <div className="text-sm text-center pt-4">{data.updater.progress.error}</div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}