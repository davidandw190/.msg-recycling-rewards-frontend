export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
}
