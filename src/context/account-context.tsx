'use client';
import { createContext, useContext } from 'react';

export const AccountContext = createContext<{ accountId: string | null }>({ accountId: null });
export const useAccount = () => useContext(AccountContext);

export function AccountProvider({
    accountId,
    children,
}: {
    accountId: string;
    children: React.ReactNode;
}) {
    return <AccountContext.Provider value={{ accountId }}>{children}</AccountContext.Provider>;
}
