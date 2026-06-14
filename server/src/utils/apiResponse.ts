export class ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(success: boolean, data: T | null, message: string, pagination?: any) {
    this.success = success;
    this.data = data;
    this.message = message;
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success<T>(data: T, message = 'Success', pagination?: any) {
    return new ApiResponse(true, data, message, pagination);
  }

  static error(message = 'Error', data: any = null) {
    return new ApiResponse(false, data, message);
  }
}
