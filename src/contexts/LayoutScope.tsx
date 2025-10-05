// src/contexts/LayoutScope.tsx
import { createContext, useContext } from "react";

type Scope = { global: boolean };
const Ctx = createContext<Scope>({ global: false });

export const LayoutScopeProvider = Ctx.Provider;
export const useLayoutScope = () => useContext(Ctx);
