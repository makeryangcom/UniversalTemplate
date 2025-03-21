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

import { Link } from "react-router-dom";

export default function NotFound(_props: any) {

    return (
        <div className="w-[400px] h-[200px] fixed top-[calc(50%-100px)] left-0 right-0 mx-auto">
            <div className="w-full space-y-2">
                <div className="w-full text-xl">Not Found</div>
                <div className="w-full text-sm">This page doesn’t exist.</div>
                <div className="w-full text-sm text-muted-foreground">If this is a mistake, <Link className="text-primary" to="https://github.com/makeryangcom" target="_blank">let us know</Link>, and we will try to fix it!</div>
            </div>
        </div>
    )
}