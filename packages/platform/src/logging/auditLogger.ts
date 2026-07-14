import { logger } from './logger';

export interface AuditEvent {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  username: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  status: 'success' | 'failure';
  failureReason?: string;
}

class AuditLogger {
  log(event: AuditEvent): void {
    logger.info(`AUDIT: ${event.action} on ${event.resource}`, {
      audit: true,
      ...event,
    });

    // Store in session storage for audit trail
    this.storeAuditEvent(event);
  }

  private storeAuditEvent(event: AuditEvent): void {
    try {
      const stored = sessionStorage.getItem('audit_trail');
      const events: AuditEvent[] = stored ? JSON.parse(stored) : [];
      events.push(event);

      // Keep only last 1000 events
      const trimmed = events.slice(-1000);
      sessionStorage.setItem('audit_trail', JSON.stringify(trimmed));
    } catch {
      // Silently fail if storage is full
    }
  }

  getAuditTrail(): AuditEvent[] {
    try {
      const stored = sessionStorage.getItem('audit_trail');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearAuditTrail(): void {
    sessionStorage.removeItem('audit_trail');
  }
}

export const auditLogger = new AuditLogger();