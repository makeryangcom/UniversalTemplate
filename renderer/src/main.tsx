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

import "./assets/styles/base.css";
import "./assets/styles/font.css";
import "./assets/styles/tailwind.css";
import "./assets/styles/themes.css";

import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "./components/base/toaster";
import router from "./router";
import { ContextState } from "./states";
import { LanguageState } from "./states/language";
import { ThemeState } from "./states/theme";

createRoot(document.getElementById("root")!).render(
    <LanguageState>
        <ThemeState>
            <ContextState>
                <RouterProvider router={router} />
            </ContextState>
            <Toaster />
        </ThemeState>
    </LanguageState>
)