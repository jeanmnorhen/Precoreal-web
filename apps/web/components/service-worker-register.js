'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceWorkerRegister = ServiceWorkerRegister;
const react_1 = require("react");
function ServiceWorkerRegister() {
    (0, react_1.useEffect)(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .catch(() => { });
        }
    }, []);
    return null;
}
