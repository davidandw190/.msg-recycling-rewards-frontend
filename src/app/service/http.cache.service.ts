import {HttpResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable()
export class HttpCacheService {
  private httpResponseCache: { [key: string]: HttpResponse<any> } = {};

  put = (key: string, httpResponse: HttpResponse<any>): void => {
    console.log('Caching response', httpResponse);
    this.httpResponseCache[key] = httpResponse;
  }

  get = (key: string): HttpResponse<any> | null | undefined => this.httpResponseCache[key];

  evict = (key: string): boolean => delete this.httpResponseCache[key];

  evictAll = (): void => {
    console.log('Clearing entire cache..');
    delete this.httpResponseCache;
  }

  logCache = (): void => console.log(this.httpResponseCache);
}
