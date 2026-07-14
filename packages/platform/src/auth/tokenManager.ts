import type { AuthService } from './authService';
import { logger } from '../logging';

class TokenManager {
  private authService: AuthService | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  initialize(authService: AuthService): void {
    this.authService = authService;
    this.startPeriodicCheck();
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.authService) return null;

    try {
      const user = await this.authService.getUser();
      if (!user) return null;

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = user.expires_at ?? 0;
      const timeUntilExpiry = expiresAt - Date.now() / 1000;

      if (timeUntilExpiry < 300) {
        // Less than 5 minutes, refresh
        return this.refreshToken();
      }

      return user.access_token;
    } catch (error) {
      logger.error('Failed to get access token', error as Error);
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    if (!this.authService) return null;

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string | null> {
    try {
      const user = await this.authService!.renewToken();
      if (user) {
        logger.info('Token refreshed successfully');
        return user.access_token;
      }
      return null;
    } catch (error) {
      logger.error('Token refresh failed', error as Error);
      throw error;
    }
  }

  private startPeriodicCheck(): void {
    // Check token expiry every 60 seconds
    this.refreshInterval = setInterval(async () => {
      try {
        const user = await this.authService?.getUser();
        if (user) {
          const expiresAt = user.expires_at ?? 0;
          const timeUntilExpiry = expiresAt - Date.now() / 1000;

          // Refresh if less than 10 minutes remaining
          if (timeUntilExpiry < 600 && timeUntilExpiry > 0) {
            await this.refreshToken();
          }
        }
      } catch (error) {
        logger.debug('Token check cycle failed', error as Error);
      }
    }, 60000);
  }

  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.authService = null;
  }
}

export const tokenManager = new TokenManager();