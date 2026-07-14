import { logger } from './logger';

interface PerformanceMark {
  name: string;
  startTime: number;
  metadata?: Record<string, unknown>;
}

class PerformanceLogger {
  private marks: Map<string, PerformanceMark> = new Map();
  private measurements: Map<string, number[]> = new Map();

  start(name: string, metadata?: Record<string, unknown>): void {
    this.marks.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  end(name: string, additionalMetadata?: Record<string, unknown>): void {
    const mark = this.marks.get(name);
    if (!mark) {
      logger.warn(`Performance mark "${name}" not found`);
      return;
    }

    const duration = performance.now() - mark.startTime;
    this.marks.delete(name);

    // Track measurement history
    const existing = this.measurements.get(name) ?? [];
    existing.push(duration);
    this.measurements.set(name, existing.slice(-100)); // Keep last 100

    logger.debug(`PERF: ${name}`, {
      perf: true,
      duration: Math.round(duration * 100) / 100,
      metadata: { ...mark.metadata, ...additionalMetadata },
    });

    // Warn if operation takes too long
    if (duration > 1000) {
      logger.warn(`PERF_WARN: ${name} took ${Math.round(duration)}ms`, {
        perf: true,
        duration,
      });
    }
  }

  async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T> {
    this.start(name, metadata);
    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }

  getAverageDuration(name: string): number | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return null;

    const total = measurements.reduce((sum, val) => sum + val, 0);
    return Math.round((total / measurements.length) * 100) / 100;
  }

  getStats(): Record<string, { avg: number | null; count: number; last: number | null }> {
    const stats: Record<string, { avg: number | null; count: number; last: number | null }> = {};

    for (const [name, measurements] of this.measurements.entries()) {
      const total = measurements.reduce((sum, val) => sum + val, 0);
      stats[name] = {
        avg: measurements.length > 0 ? Math.round((total / measurements.length) * 100) / 100 : null,
        count: measurements.length,
        last: measurements.length > 0 ? measurements[measurements.length - 1] ?? null : null,
      };
    }

    return stats;
  }

  clear(): void {
    this.marks.clear();
    this.measurements.clear();
  }
}

export const performanceLogger = new PerformanceLogger();