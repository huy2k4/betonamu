# Backend Development Skills and Best Practices

This document outlines backend (BE) guidelines and development patterns for the Antigravity agent.

## Core Best Practices

### 1. Robust Error Handling (Zero-Bypass)
- **Never bypass error handling**: Every operation that can fail (database calls, external API queries, file reads/writes, network operations) must be wrapped in `try-catch` blocks or explicit error checks.
- **Log Errors Properly**: Avoid silent catch blocks. Log all caught exceptions with descriptive contexts, stack traces, and severity levels.
- **Graceful Error Responses**: When building API endpoints, never return a raw database or language exception message to the user/client. Return clean, formatted HTTP responses (e.g. JSON with a message and error code) and the correct HTTP status code (400, 401, 403, 404, 500).

### 2. No Hardcoded Configuration & Strings
- **Environment Variables**: Store database connections, external APIs, third-party keys, passwords, ports, and environment flags in configuration files (e.g. `.env`) and access them through environment variables or a configuration service.
- **No Hardcoded Constants**: Do not embed constant values directly into logic code. Keep backend message templates, response codes, and localizable messages in specific constants modules.

### 3. Modular Architecture
- **Layer Separation**: Keep controllers, router definitions, services/business logic, validation schemas, and data models decoupled.
- **Single Responsibility Principle**: Each module, class, and function should have one clear purpose.
- **Input Validation**: Validate all incoming payload parameters against schemas (e.g. using validation libraries like Zod, Joi, Pydantic, etc.) before executing any business logic.
