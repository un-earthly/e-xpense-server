import { ApiResponse } from '../interfaces/api-response.interface';

export class ResponseUtil {
    static success<T>(message: string, data?: T): ApiResponse<T> {
        return {
            success: true,
            message,
            data,
            timestamp: new Date(),
        };
    }

    static error(message: string, code: string, details?: any): ApiResponse<null> {
        return {
            success: false,
            message,
            error: {
                code,
                details,
            },
            timestamp: new Date(),
        };
    }
}