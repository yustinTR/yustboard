import { NextResponse } from 'next/server';

/**
 * Standardized API response helpers for consistent error handling
 */

export class ApiResponse {
  /**
   * Success response
   */
  static success<T = unknown>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  /**
   * Error response with consistent format
   */
  static error(message: string, status: number = 500) {
    return NextResponse.json({ error: message }, { status });
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  /**
   * Forbidden response
   */
  static forbidden(message: string = 'Forbidden') {
    return this.error(message, 403);
  }

  /**
   * Not found response
   */
  static notFound(message: string = 'Not found') {
    return this.error(message, 404);
  }

  /**
   * Bad request response
   */
  static badRequest(message: string = 'Bad request') {
    return this.error(message, 400);
  }

  /**
   * Internal server error response
   */
  static serverError(message: string = 'Internal server error') {
    return this.error(message, 500);
  }

  /**
   * Method not allowed response
   */
  static methodNotAllowed(message: string = 'Method not allowed') {
    return this.error(message, 405);
  }

  /**
   * Created response (201)
   */
  static created<T = unknown>(data: T) {
    return this.success(data, 201);
  }

  /**
   * No content response (204)
   */
  static noContent() {
    return new NextResponse(null, { status: 204 });
  }
}

/**
 * Wrap async API route handlers with error handling
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          return ApiResponse.unauthorized();
        }
        if (error.message.includes('Forbidden') || error.message.includes('403')) {
          return ApiResponse.forbidden();
        }
        if (error.message.includes('Not found') || error.message.includes('404')) {
          return ApiResponse.notFound();
        }

        // Default server error with the actual error message in development
        const message = process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error';
        return ApiResponse.serverError(message);
      }

      return ApiResponse.serverError();
    }
  }) as T;
}