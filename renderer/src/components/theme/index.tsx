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
import { Label } from "@/components/base/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover";
import { useThemeState } from "@/states/theme";
import { cn } from "@/utils";
import { baseColors } from "@/utils/color";
import { Check, Moon, MoonIcon, Paintbrush, Repeat, Sun, SunIcon } from "lucide-react";

export function ThemeMode() {

    const { config, updateConfig } = useThemeState();

    function onModeSwitcher() {
        config.mode = config.mode === "dark" ? "light" : "dark";
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(`${config.mode}`);
        updateConfig(config);
    }

    return (
        <div className="w-auto no-drag">
            <Button variant="ghost" size="icon" onClick={onModeSwitcher}>
                {config.mode === "dark" ? <SunIcon /> : <MoonIcon />}
            </Button>
        </div>
    );
}

export function ThemeCustomize() {

    const { config, updateConfig } = useThemeState();

    function onReset(){
        onColorSwitcher("");
        onRadiusSwitcher("0.5");
        onModeSwitcher("light");
    }

    function onColorSwitcher(name: string) {
        config.name = name;
        document.documentElement.classList.remove(
            ...baseColors.map((color: any) => `theme-${color.name}`),
        );
        document.documentElement.classList.add(`theme-${config.name}`);
        updateConfig(config);
    }

    function onRadiusSwitcher(radius: any) {
        config.radius = radius;
        document.documentElement.style.setProperty("--radius", `${config.radius}rem`);
        updateConfig(config);
    }

    function onModeSwitcher(mode: string) {
        config.mode = mode;
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(`${config.mode}`);
        updateConfig(config);
    }

    return (
        <div className="w-auto no-drag">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Paintbrush />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side-offset="12" align="end" className="w-[340px] border-b border-border z-[1000]">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-start pt-4 md:pt-0">
                            <div className="space-y-1 pr-2">
                                <div className="font-semibold leading-none tracking-tight">Theme Customizer</div>
                                <div className="text-xs text-muted-foreground">Customize your components colors.</div>
                            </div>
                            <Button onClick={onReset} variant="ghost" size="icon" className="ml-auto rounded-md">
                                <Repeat />
                            </Button>
                        </div>
                        <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Color</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {baseColors.filter((theme: any) => !["slate", "stone", "gray", "neutral"].includes(theme.name)).map((theme: any) => {
                                        const isActive = config.name === theme.name;
                                        return (
                                            <Button onClick={() => { onColorSwitcher(theme.name) }} variant={"outline"} size="sm" key={theme.name} className={cn("justify-start", isActive && "border-2 border-primary")} style={{ "--theme-primary": `hsl(${theme?.activeColor[config.mode === "dark" ? "dark" : "light"]})` } as React.CSSProperties}>
                                                <span className={cn("mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]")}>
                                                    {isActive && <Check className="h-4 w-4 text-white" />}
                                                </span>
                                                {theme.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Radius</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {["0", "0.3", "0.5", "0.75", "1.0"].map((value: any) => {
                                        return (
                                            <Button onClick={() => { onRadiusSwitcher(value) }} variant={"outline"} size="sm" key={value} className={cn(config.radius === value && "border-2 border-primary")}>
                                                {value}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Mode</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button onClick={()=>{onModeSwitcher("light")}} variant={"outline"} size="sm" className={cn(config.mode === "light" && "border-2 border-primary")}>
                                        <Sun className="mr-1 -translate-x-1" />
                                        <span>Light</span>
                                    </Button>
                                    <Button onClick={()=>{onModeSwitcher("dark")}}  variant={"outline"} size="sm" className={cn(config.mode === "dark" && "border-2 border-primary")}>
                                        <Moon className="mr-1 -translate-x-1" />
                                        <span>Dark</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}