/**
 * Represents the structure of a custom HTTP response from the server.
 * @template T - Type of data included in the response.
 */
export interface CustomHttpResponse<T> {
  timestamp: Date;
  statusCode: number;
  status: string;
  message: string;
  reason?: string;
  _devMessage?: string;
  data?: T;
}
