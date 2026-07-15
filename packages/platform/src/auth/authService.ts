import { UserManager, WebStorageStateStore, type User, type UserManagerSettings } from 'oidc-client-ts';
import type { AuthConfig } from '../types';

export interface AuthService {
  getUser(): Promise<User | null>;
  signinRedirect(): Promise<void>;
  signinRedirectCallback(): Promise<User>;
  signoutRedirect(): Promise<void>;
  signoutRedirectCallback(): Promise<void>;
  signinSilent(): Promise<User | null>;
  renewToken(): Promise<User | null>;
  startSilentRenew(): void;
  stopSilentRenew(): void;
  events: {
    addUserLoaded(callback: () => void): void;
    removeUserLoaded(callback: () => void): void;
    addUserUnloaded(callback: () => void): void;
    removeUserUnloaded(callback: () => void): void;
    addSilentRenewError(callback: (error: Error) => void): void;
    removeSilentRenewError(callback: (error: Error) => void): void;
    addAccessTokenExpiring(callback: () => void): void;
    removeAccessTokenExpiring(callback: () => void): void;
    addAccessTokenExpired(callback: () => void): void;
    removeAccessTokenExpired(callback: () => void): void;
    addUserSignedOut(callback: () => void): void;
    removeUserSignedOut(callback: () => void): void;
  };
}

export function createAuthService(config: AuthConfig): AuthService {
  const settings: UserManagerSettings = {
    authority: config.authority,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    post_logout_redirect_uri: config.postLogoutRedirectUri,
    response_type: config.responseType,
    scope: config.scope,
    automaticSilentRenew: config.silentRefresh,
    monitorSession: config.sessionCheck,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  } as UserManagerSettings;

  const userManager = new UserManager(settings);

  return {
    getUser: () => userManager.getUser(),
    signinRedirect: () => userManager.signinRedirect() as unknown as Promise<void>,
    signinRedirectCallback: () => userManager.signinRedirectCallback(),
    signoutRedirect: () => userManager.signoutRedirect() as unknown as Promise<void>,
    signoutRedirectCallback: () => userManager.signoutRedirectCallback() as unknown as Promise<void>,
    signinSilent: () => userManager.signinSilent(),
    renewToken: async () => {
      const user = await userManager.getUser();
      if (user?.expired ?? true) {
        return userManager.signinSilent();
      }
      return user;
    },
    startSilentRenew: () => userManager.startSilentRenew(),
    stopSilentRenew: () => userManager.stopSilentRenew(),
    events: {
      addUserLoaded: (cb) => userManager.events.addUserLoaded(cb),
      removeUserLoaded: (cb) => userManager.events.removeUserLoaded(cb),
      addUserUnloaded: (cb) => userManager.events.addUserUnloaded(cb),
      removeUserUnloaded: (cb) => userManager.events.removeUserUnloaded(cb),
      addSilentRenewError: (cb) => userManager.events.addSilentRenewError(cb),
      removeSilentRenewError: (cb) => userManager.events.removeSilentRenewError(cb),
      addAccessTokenExpiring: (cb) => userManager.events.addAccessTokenExpiring(cb),
      removeAccessTokenExpiring: (cb) => userManager.events.removeAccessTokenExpiring(cb),
      addAccessTokenExpired: (cb) => userManager.events.addAccessTokenExpired(cb),
      removeAccessTokenExpired: (cb) => userManager.events.removeAccessTokenExpired(cb),
      addUserSignedOut: (cb) => userManager.events.addUserSignedOut(cb),
      removeUserSignedOut: (cb) => userManager.events.removeUserSignedOut(cb),
    },
  };
}