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

import { Button } from "@/packages/base/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";

export function GithubLink() {

    return (
        <Link to="https://github.com/makeryangcom" target="_blank">
            <Button variant="outline" size="icon">
                <GitHubLogoIcon className="w-4 h-4" />
            </Button>
        </Link>
    );
}