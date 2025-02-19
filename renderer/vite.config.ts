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

import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import path from "path";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import Package from "../package.json";

export default defineConfig(({mode})=> ({
    root: __dirname,
    base: "./",
    define: {
        __APP_NAME__: JSON.stringify(Package.title),
		__APP_VERSION__: JSON.stringify(Package.version),
        __APP_LOCAL_STORAGE_PREFIX__: JSON.stringify(Package.env.LOCAL_STORAGE_PREFIX),
        __APP_HEADER_REFERER__: JSON.stringify(Package.env.HEADER_REFERER),
        __APP_HEADER_SOURCE__: JSON.stringify(Package.env.HEADER_SOURCE),
        __VITE_DEV_HOST__: JSON.stringify(Package.env.VITE_DEV_SERVER_HOST),
    },
    esbuild: {
        drop: mode === "production" ? ["debugger"] : [],
    },
    plugins: [
        react()
    ],
    server: {
        host: Package.env.VITE_DEV_SERVER_HOST,
        port: Package.env.VITE_DEV_SERVER_PORT,
    },
    css: {
        postcss: {
            plugins: [tailwind(), autoprefixer()],
        }
    },
    build: {
        outDir: "../release/dist/renderer",
        emptyOutDir: true,
        sourcemap: false,
        cssCodeSplit: true,
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        commonjsOptions: {
            requireReturnsDefault: "namespace",
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
