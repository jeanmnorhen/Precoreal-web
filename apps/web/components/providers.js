'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = Providers;
const auth_context_1 = require("@/lib/auth-context");
function Providers({ children }) {
    return <auth_context_1.AuthProvider>{children}</auth_context_1.AuthProvider>;
}
