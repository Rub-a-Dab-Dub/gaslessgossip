import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../services/response.service';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: any) => {
        // If the controller already returns a properly formatted response
        if (
          data &&
          typeof data === 'object' &&
          'error' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data;
        }

        // Special handling for 412 unverified account response - preserve all fields including userId
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          data.code === 412
        ) {
          // Debug logging to verify data contains userId
          console.log('[ResponseInterceptor] Received 412 response. Data:', JSON.stringify(data, null, 2));
          console.log('[ResponseInterceptor] userId in data:', data.userId);
          
          // Preserve all fields from the original data object, especially userId
          const wrapped = {
            error: false,
            message: 'successful',
            data: {
              ...data, // Spread all properties to ensure userId and any other fields are preserved
            },
          };
          
          console.log('[ResponseInterceptor] Wrapped response:', JSON.stringify(wrapped, null, 2));
          console.log('[ResponseInterceptor] userId in wrapped.data:', wrapped.data.userId);
          
          return wrapped;
        }

        // Detect paginated responses
        const isPaginated =
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data &&
          Array.isArray(data.data) &&
          typeof data.meta === 'object';

        if (isPaginated) {
          return {
            error: false,
            message: 'successful',
            data: {
              items: data.data,
              meta: data.meta,
            },
          };
        }

        // Default success format
        return {
          error: false,
          message: 'successful',
          data,
        };
      }),
    );
  }
}
