export class ResponseDto<T> {
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
  };

  constructor(statusCode: number, message: string, data?: T, meta?: any) {
    this.statusCode = statusCode;
    this.message = message;
    if (data) this.data = data;
    if (meta) this.meta = meta;
  }
}
