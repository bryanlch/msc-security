export enum AppMessages {
  BOOTSTRAP_START = '🚀 Starting application bootstrap...',
  SWAGGER_AVAILABLE = '📚 Swagger documentation available at /api',
  REDIS_CONNECTING = '🔌 Connecting to Redis at {host}:{port}...',
  REDIS_SUCCESS = '✅ Redis microservice connected successfully',
  REDIS_ERROR = '❌ Redis connection error: {message}',
  REDIS_FALLBACK = '⚠️  Application will continue without Redis microservice',
  SERVER_LISTENING = '🚀 Server is listening on port {port}',
  ENVIRONMENT = '🌍 Environment: {env}',
  VALIDATION_PIPE = '🛡️  Validation pipe configured',
  SHUTDOWN_HOOKS = '🔌 Enable shutdown hooks',
  GLOBAL_PREFIX = '🔗 Global prefix set to: {prefix}',
}

export enum ErrorMessages {
  CONFIG_MISSING = '❌ Configuration missing for: {key}',
  BOOTSTRAP_FAILED = '💥 Application bootstrap failed',
}
