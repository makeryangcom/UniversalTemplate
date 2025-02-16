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

export interface State {
    data: {
        version: string,
        header: {
            tools: {
                max: boolean
            }
        }
    }
}

interface Actions {
    updateData: (data: State["data"]) => void;
}

interface Props extends State, Actions {};

const default_props: Props = {
    data: {
        version: "0.0.1",
        header: {
            tools: {
                max: false
            }
        }
    },
    updateData: () => {},
}

const Context = createContext<Props>(default_props);

export const useContextState = () => {
    return useContext(Context);
};

export const ContextState = ({ children }: { children: ReactNode }) => {

    const [data, setData] = useState<State["data"]>(default_props.data);

    const updateData = (data: State["data"]) => {
        setData((prev: any) => ({ ...prev, ...data }));
    };

    const value: any = {
        data,
        updateData
    }

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    );
};