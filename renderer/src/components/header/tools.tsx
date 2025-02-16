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

import { Button } from "@/components/base/button";
import { useIsElectron } from "@/hooks/use-electron";
import { useIsPlatform } from "@/hooks/use-platform";
import { useContextState } from "@/states";
import { BoxIcon, Cross1Icon, RotateCounterClockwiseIcon } from "@radix-ui/react-icons";
import { MinusIcon } from "lucide-react";
import { useEffect } from "react";

export function HeaderTools() {

    const { data, updateData } = useContextState();
    const platform = useIsPlatform();
    const electron = useIsElectron();

    function onTools(type: string) {
        if (electron) {
            (window as any).base.ipc.send("message", { type: "template:header:right:button", data: type });
        }
    }

    function onListenerResize() {
        if (electron) {
            (window as any).base.ipc.send("message", { type: "template:window:resize", data: "resize" });
            window.addEventListener("resize", function () {
                (window as any).base.ipc.send("message", { type: "template:window:resize", data: "resize" });
            });
        }
    }

    useEffect(() => {
        if (electron) {
            onListenerResize();
            (window as any).base.ipc.on("message", (_event: any, message: any) => {
                console.log(message);
                if (message.type === "main:window:resize") {
                    data.header.tools.max = message.data !== "restore";
                    updateData(data);
                }
            });
        }
        return () => {};
    }, []);

    return (
        <>
            {(platform === "windows" && electron) && (
                <div className="w-auto space-x-2 no-drag">
                    <Button onClick={() => { onTools("min") }} className="w-8 h-8" variant="ghost" size="icon" title="最小化">
                        <MinusIcon className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => { onTools("size") }} className="w-8 h-8" variant="ghost" size="icon" title={data.header.tools.max ? "还原" : "全屏"}>
                        {data.header.tools.max ? <RotateCounterClockwiseIcon className="w-4 h-4" /> : <BoxIcon className="w-4 h-4" />}
                    </Button>
                    <Button onClick={() => { onTools("close") }} className="w-8 h-8" variant="ghost" size="icon" title="关闭">
                        <Cross1Icon className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </>
    );
}