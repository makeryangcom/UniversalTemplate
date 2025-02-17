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

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import axios from "axios";

export interface Request {
    instance: any;
}

interface Actions {
    setToken: (token: string) => void;
    getToken: () => string;
    clearToken: () => void;
    do: (method: string, path: string, params: object, data: object) => Promise<any>;
}

interface Props extends Request, Actions {};

const local_storage_name = __APP_LOCAL_STORAGE_PREFIX__ + ":login:token";

const default_props: Props = {
    instance: axios.create({
        baseURL: "",
        timeout: 60000,
    }),
    setToken: (token: string) => {
        localStorage.setItem(local_storage_name, token);
    },
    getToken() {
        return localStorage.getItem(local_storage_name) || "";
    },
    clearToken: () => {
        localStorage.removeItem(local_storage_name);
    },
    do: async (method: string, path: string, params: object, data: object) => {
        return FingerprintJS.load().then((fp: any) => {
            return fp.get().then((result: any) => {
                return default_props.instance({
                    baseURL: "",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-X-Time": Date.now().toString(),
                        "Content-X-Device": result.visitorId,
                        "Content-X-Referer": "geekros.com",
                        "Content-X-Source": "browser",
                        "Content-X-IP": "0.0.0.0",
                        "Content-X-Sign": default_props.getToken(),
                    },
                    url: path,
                    method: method,
                    params: params ? params : {},
                    data: data ? data : {}
                });
            });
        }).catch((_error: any)=>{
            return default_props.instance({
                baseURL: "",
                headers: {
                    "Content-Type": "application/json",
                    "Content-X-Time": Date.now().toString(),
                    "Content-X-Device": "error",
                    "Content-X-Referer": "geekros.com",
                    "Content-X-Source": "browser",
                    "Content-X-IP": "0.0.0.0",
                    "Content-X-Sign": "",
                },
                url: path,
                method: method,
                params: params ? params : {},
                data: data ? data : {}
            });
        });
    }
}

default_props.instance.interceptors.response.use(
    (response: any) => {
        if (response.status === 200) {
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },
    (error: any) => {
        if(error.response){
            if (error.response.status) {
                return false;
            }
        }
        return false;
    }
);

export const useRequest = () => {
    return default_props;
};