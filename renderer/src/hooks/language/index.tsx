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

import i18next from "i18next";
import Backend from "i18next-http-backend";
import { createContext, useContext, useEffect, useState } from "react";
import { initReactI18next, useTranslation } from "react-i18next";

const local_storage_name = __APP_LOCAL_STORAGE_PREFIX__ + ":language";

const isBrowser = typeof window !== "undefined";
const language = isBrowser && localStorage.getItem(local_storage_name) || navigator.language.slice(0, 2).toLowerCase();

const Context = createContext({
    i18next: i18next,
    language: language,
    lang: (lang: string) => lang,
    change: (_lang: any) => {},
});

i18next.use(initReactI18next).use(Backend).init({
    lng: language,
    fallbackLng: "en",
    debug: false,
    backend: {
        loadPath: "./locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common"],
    defaultNS: "common",
});

export const useLanguageState = () => useContext(Context);

export const LanguageState= ({ children }: any) => {

    const [language, setLanguage] = useState(i18next.language);

    useEffect(() => {
        const savedLanguage = localStorage.getItem(local_storage_name);
        if (savedLanguage) {
            i18next.changeLanguage(savedLanguage);
            setLanguage(savedLanguage);
        } else {
            const browserLanguage = i18next.language;
            i18next.changeLanguage(browserLanguage);
            setLanguage(browserLanguage);
        }
    }, []);

    const { t } = useTranslation();

    const lang = (key: string) => t(key);

    const change = (lang: any) => {
        i18next.changeLanguage(lang);
        setLanguage(lang);
        localStorage.setItem(local_storage_name, lang);
    };

    return (
        <Context.Provider value={{ i18next, language, lang, change }}>
            {children}
        </Context.Provider>
    );
};