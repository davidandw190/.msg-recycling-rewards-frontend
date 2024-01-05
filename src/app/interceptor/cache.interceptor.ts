import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { HttpCacheService } from "../service/http.cache.service";

@Injectable({
  providedIn: 'root',
})
export class CacheInterceptor implements HttpInterceptor {

  constructor(private httpCache: HttpCacheService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown> | HttpResponse<unknown>> {
    // Bypasses caching for certain endpoints
    if (this.shouldBypassCache(request)) {
      return next.handle(request);
    }

    // Clears cache for non-GET requests or download requests
    if (this.shouldClearCache(request)) {
      this.httpCache.evictAll();
      return next.handle(request);
    }

    // Tries to get response from cache
    const cachedResponse: HttpResponse<any> | undefined = this.httpCache.get(request.url);
    if (cachedResponse) {
      console.log('Found Response in Cache', cachedResponse);
      this.httpCache.logCache();
      return of(cachedResponse);
    }

    // Handles the request and cache the response
    return this.handleRequestCache(request, next);
  }

  private handleRequestCache(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        tap(response => {
          if (response instanceof HttpResponse && request.method !== 'DELETE') {
            console.log('Caching Response', response);
            this.httpCache.put(request.url, response);
          }
        })
      );
  }

  private shouldBypassCache(request: HttpRequest<any>): boolean {
    const bypassUrls = [ '/search/', 'verify', 'login', 'register', 'refresh', 'reset-pass', 'verify', 'new/password'];
    return bypassUrls.some(url => request.url.includes(url));
  }

  private shouldClearCache(request: HttpRequest<any>): boolean {
    return request.method !== 'GET' || request.url.includes('download');
  }
}
