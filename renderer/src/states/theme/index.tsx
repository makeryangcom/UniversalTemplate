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

import { createContext, ReactNode, useContext, useState } from "react";

export interface Theme {
    config: {
        radius: string,
        name: string,
        mode: string
    }
}

interface Actions {
    updateConfig: (config: Theme["config"]) => void;
}

interface Props extends Theme, Actions {};

const default_props: Props = {
    config: {
        radius: localStorage.getItem("template:theme:radius") || "0.5",
        name: localStorage.getItem("template:theme:name") || "zinc",
        mode: localStorage.getItem("template:theme:mode") || "light",
    },
    updateConfig: () => {},
}

const Context = createContext<Props>(default_props);

export const useThemeState = () => {
    return useContext(Context);
};

export const ThemeState = ({ children }: { children: ReactNode }) => {

    const [config, setConfig] = useState<Theme["config"]>(default_props.config);

    document.documentElement.style.setProperty("--radius", `${config.radius}rem`);
    document.documentElement.style.setProperty("color-scheme", `${config.mode}`);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(`${config.mode}`);
    document.documentElement.classList.add(`theme-${config.name}`);

    const updateConfig = (config: Theme["config"]) => {
        localStorage.setItem("template:theme:radius", config.radius);
        localStorage.setItem("template:theme:name", config.name);
        localStorage.setItem("template:theme:mode", config.mode);
        setConfig((prev: any) => ({ ...prev, ...config }));
    };

    const value: any = {
        config,
        updateConfig
    }

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    );
};