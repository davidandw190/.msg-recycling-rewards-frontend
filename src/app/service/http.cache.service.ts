import { HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpCacheService {
  private httpResponseCache: { [key: string]: HttpResponse<any> } = {};

  put(key: string, httpResponse: HttpResponse<any>): void {
    console.log('Caching response', httpResponse);
    this.httpResponseCache[key] = httpResponse;
  }

  get(key: string): HttpResponse<any> | undefined {
    return this.httpResponseCache[key];
  }

  evict(key: string): boolean {
    const exists = key in this.httpResponseCache;
    if (exists) {
      console.log('Evicting cache for key', key);
      delete this.httpResponseCache[key];
    }
    return exists;
  }

  evictAll(): void {
    console.log('Clearing entire cache..');
    this.httpResponseCache = {};
  }

  logCache(): void {
    console.log('Current Cache:', this.httpResponseCache);
  }
}
