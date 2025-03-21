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

import NotFound from "@/app/404";
import { createBrowserRouter, createHashRouter } from "react-router-dom";
import Pages from "../../app";
import { useIsElectron } from "../use-electron";

const router_page: any = [
    {
        path: "/",
        element: <Pages />
    },
    {
        path: "*",
        element: <NotFound />
    },
];

const router = useIsElectron() ? createHashRouter(router_page) : createBrowserRouter(router_page);

export default router;