// =================================================================
// Logging Module
// =================================================================
// Responsibilities:
// - Structured logging with levels (debug, info, warn, error)
// - Console and remote logging support
// - Log batching and queuing
// - Performance logging
// - Audit trail logging
// =================================================================

export { logger } from './logger';
export { auditLogger } from './auditLogger';
export { performanceLogger } from './performanceLogger';
export type { LogLevel, LogEntry, LoggerConfig } from './types';