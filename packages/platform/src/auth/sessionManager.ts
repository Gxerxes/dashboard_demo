import type { AuthService } from './authService';
import { logger } from '../logging';

class SessionManager {
  private authService: AuthService | null = null;
  private sessionCheckInterval: ReturnType<typeof setInterval> | null = null;
  private inactivityTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime: number = Date.now();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CHECK_INTERVAL = 60 * 1000; // 1 minute

  initialize(authService: AuthService): void {
    this.authService = authService;
    this.startSessionMonitoring();
    this.setupActivityListeners();
  }

  private startSessionMonitoring(): void {
    this.sessionCheckInterval = setInterval(async () => {
      await this.checkSessionStatus();
    }, this.CHECK_INTERVAL);
  }

  private setupActivityListeners(): void {
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      this.resetInactivityTimer();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    this.inactivityTimeout = setTimeout(async () => {
      logger.warn('Session timeout due to inactivity');
      await this.handleSessionTimeout();
    }, this.SESSION_TIMEOUT);
  }

  private async checkSessionStatus(): Promise<void> {
    if (!this.authService) return;

    try {
      const user = await this.authService.getUser();
      if (!user) {
        logger.info('No active session found');
        return;
      }

      const expiresAt = user.expires_at ?? 0;
      const timeUntilExpiry = expiresAt - Date.now() / 1000;

      // Warn if session expiring soon (within 5 minutes)
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
        logger.warn('Session expiring soon', {
          expiresIn: `${Math.round(timeUntilExpiry)} seconds`,
        });
        this.dispatchSessionWarning(timeUntilExpiry);
      }

      // Session expired
      if (timeUntilExpiry <= 0) {
        logger.info('Session expired');
        await this.handleSessionExpired();
      }
    } catch (error) {
      logger.error('Session check failed', error as Error);
    }
  }

  private async handleSessionTimeout(): Promise<void> {
    try {
      await this.authService?.signoutRedirect();
    } catch (error) {
      logger.error('Session timeout logout failed', error as Error);
    }
  }

  private async handleSessionExpired(): Promise<void> {
    try {
      const user = await this.authService?.signinSilent();
      if (user) {
        logger.info('Session silently renewed');
      } else {
        await this.handleSessionTimeout();
      }
    } catch (error) {
      logger.error('Session renewal failed', error as Error);
      await this.handleSessionTimeout();
    }
  }

  private dispatchSessionWarning(timeUntilExpiry: number): void {
    window.dispatchEvent(
      new CustomEvent('session:expiring', {
        detail: { timeUntilExpiry: Math.round(timeUntilExpiry) },
      }),
    );
  }

  async extendSession(): Promise<boolean> {
    try {
      const user = await this.authService?.renewToken();
      if (user) {
        logger.info('Session extended successfully');
        this.lastActivityTime = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Session extension failed', error as Error);
      return false;
    }
  }

  getSessionInfo(): { isActive: boolean; timeUntilExpiry: number; lastActivity: number } {
    return {
      isActive: this.authService !== null,
      timeUntilExpiry: this.SESSION_TIMEOUT - (Date.now() - this.lastActivityTime),
      lastActivity: this.lastActivityTime,
    };
  }

  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    this.authService = null;
  }
}

export const sessionManager = new SessionManager();