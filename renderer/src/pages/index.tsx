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
import { Language } from "@/components/language";
import { ThemeCustomize, ThemeMode } from "@/components/theme";
import { useLanguageState } from "@/states/language";
import { ChevronRight } from "lucide-react";
import { useContextState } from "../states";


export default function Pages(_props: any) {

    const { data } = useContextState();

    const { lang } = useLanguageState();

    return (
        <div className="page">
            <div className="w-full fixed top-0 left-0 right-0 p-2 flex items-center justify-end space-x-2 drag">
                <Language />
                <ThemeCustomize />
                <ThemeMode />
            </div>
            <div className="w-[400px] h-[130px] top-[calc(50%-65px)] fixed left-0 right-0 m-auto space-y-3">
                <div className="w-full text-xl font-bold leading-tight tracking-tighter space-x-2">
                    <span className="w-auto">Vite + React + TypeScript</span>
                    <span className="w-auto">{data.version}</span>
                </div>
                <p className="w-full">Electron For (Browser and Desktop) Template</p>
                <div className="w-auto flex items-center space-x-2">
                    <Button>{lang("button")}</Button>
                    <Button variant="secondary">{lang("button")}</Button>
                    <Button variant="destructive">{lang("button")}</Button>
                    <Button variant="ghost">{lang("button")}</Button>
                    <Button variant="outline" size="icon">
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}