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

import { useLanguageState } from "@/hooks/language";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/packages/base/button";
import { ToastAction } from "@/packages/base/toast";
import { HeaderTools } from "@/packages/header/tools";
import { Language } from "@/packages/language";
import { ThemeCustomize, ThemeMode } from "@/packages/theme";
import { ChevronRight } from "lucide-react";
import { useContextState } from "../hooks";

export default function Pages(_props: any) {

    const { toast } = useToast();
    const { data } = useContextState();
    const { lang } = useLanguageState();

    function onToast(type: string) {
        if(type === "default"){
            toast({
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request."
            });
        }
        if(type === "action"){
            toast({
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
        if(type === "destructive"){
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
    }

    return (
        <div className="page">
            <div className="w-full fixed top-0 left-0 right-0 p-2 flex items-center justify-end space-x-2 drag">
                <Language />
                <ThemeCustomize />
                <ThemeMode />
                <HeaderTools />
            </div>
            <div className="w-[400px] h-[130px] top-[calc(50%-65px)] fixed left-0 right-0 m-auto space-y-3">
                <div className="w-full text-xl font-bold leading-tight tracking-tighter space-x-2">
                    <span className="w-auto">Vite + React + TypeScript</span>
                    <span className="w-auto">{data.version}</span>
                </div>
                <p className="w-full">For (Browser and Electron Desktop) Template</p>
                <div className="w-auto flex items-center space-x-2">
                    <Button>{lang("button")}</Button>
                    <Button onClick={()=>{onToast("action")}} variant="secondary">{lang("button")}</Button>
                    <Button onClick={()=>{onToast("destructive")}} variant="destructive">{lang("button")}</Button>
                    <Button onClick={()=>{onToast("default")}} variant="ghost">{lang("button")}</Button>
                    <Button variant="outline" size="icon">
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}