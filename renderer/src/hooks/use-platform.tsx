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

export function useIsPlatform() {
    const userAgent = (navigator as any).userAgent;
    if (userAgent.includes("Windows")) {
        return "windows";
    }
    if (userAgent.includes("Mac")) {
        return "mac";
    }
    if (userAgent.includes("Linux")) {
        return "linux";
    }
    return "-";
}