import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth0, User as Auth0User } from '@auth0/auth0-react';

interface AuthContextType {
  user: Auth0User | undefined;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessToken: () => Promise<string>;
  isAdmin: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    loginWithRedirect, 
    logout: auth0Logout,
    getAccessTokenSilently 
  } = useAuth0();

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const getAccessToken = async () => {
    try {
        return await getAccessTokenSilently();
    } catch (error) {
        console.error("Error getting token", error);
        throw error;
    }
  };

  const readEnvString = (value: unknown): string | undefined => {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
  };

  const parseCsv = (value: string | undefined): string[] => {
    if (!value) return [];
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const getUserRoles = (auth0User: Auth0User | undefined): string[] => {
    if (!auth0User) return [];

    const userAny = auth0User as unknown as Record<string, unknown>;

    const rolesClaimKey = readEnvString((import.meta as any).env?.VITE_AUTH0_ROLES_CLAIM);
    const candidateKeys = [
      rolesClaimKey,
      'roles',
      'role',
      'http://schemas.djpimpim.com/roles',
      'https://schemas.djpimpim.com/roles',
      'https://djpimpim.com/roles',
    ].filter(Boolean) as string[];

    for (const key of candidateKeys) {
      const value = userAny[key];
      if (Array.isArray(value)) {
        return value.filter((v): v is string => typeof v === 'string');
      }
      if (typeof value === 'string') {
        return [value];
      }
    }

    return [];
  };

  const roles = getUserRoles(user);
  const isAdminByRole = roles.some((r) => r.toLowerCase() === 'admin');

  const adminEmails = parseCsv(readEnvString((import.meta as any).env?.VITE_ADMIN_EMAILS));
  const userEmail = (user as any)?.email as string | undefined;
  const isAdminByEmail = !!userEmail && adminEmails.some((e) => e.toLowerCase() === userEmail.toLowerCase());

  // Admin access requires explicit role claim or email allowlist entry.
  const isAdmin = !!isAuthenticated && (isAdminByRole || isAdminByEmail);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isLoading,
      getAccessToken,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};