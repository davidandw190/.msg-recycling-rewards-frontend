import { UserService } from "../service/user.service";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { CustomHttpResponse } from "../interface/custom-http-response";
import { Profile } from "../interface/profile";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Key } from "../enum/key.enum";

/**
 * TokenInterceptor is responsible for adding authentication tokens to outgoing HTTP requests
 * and handling access token refresh when a 401 Unauthorized response is encountered due to an expired access token,
 * but the refresh token is still valid.
 */
@Injectable({ providedIn: "root"})
export class TokenInterceptor implements HttpInterceptor {
  private isTokenRefreshing: boolean = false;
  private refreshTokenSubject: BehaviorSubject<CustomHttpResponse<Profile>> = new BehaviorSubject(null);

  constructor(private userService: UserService) {}

  /**
   * Intercepts HTTP requests and adds the Authorization token to secure routes.
   * Handles token refresh for expired tokens.
   *
   * @param request - The HTTP request.
   * @param next - The HTTP handler for the next interceptor or the backend.
   * @returns Observable<HttpEvent<unknown>> - Observable for handling the HTTP event.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> | Observable<HttpResponse<unknown>> {
    if (this.isNonSecuredRoute(request.url)) {
      return next.handle(request);
    }

    return next.handle(this.addAuthorizationTokenHeader(request))
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (this.isTokenExpiredError(error)) {
            return this.handleRefreshToken(request, next);
          } else {
            return throwError(() => error);
          }
        })
      );
  }

  /**
   * Handles the token refresh process.
   *
   * @param request - The original HTTP request.
   * @param next - The HTTP handler for the next interceptor or the backend.
   * @returns Observable<HttpEvent<unknown>> - Observable for handling the HTTP event after token refresh.
   */
  private handleRefreshToken(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isTokenRefreshing) {
      console.log('Refreshing Token...');
      this.isTokenRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.userService.refreshToken$().pipe(
        switchMap((response) => {
          console.log('Token Refresh Response:', response);
          this.isTokenRefreshing = false;
          this.refreshTokenSubject.next(response);
          console.log('New Token:', response.data.access_token);
          console.log('Sending original request:', request);
          return next.handle(this.addAuthorizationTokenHeader(request, response.data.access_token));
        })
      );

    } else {
      return this.waitForTokenRefresh(request, next);
    }
  }

  /**
   * Checks if the URL corresponds to a non-secured route.
   *
   * @param url - The URL of the HTTP request.
   * @returns boolean - True if the URL is a non-secured route, otherwise false.
   */
  private isNonSecuredRoute(url: string): boolean {
    const nonSecuredRoutes: string[] = ['/user/verify', '/user/login', '/user/register', '/user/refresh/token', '/user/reset-pass'];
    return nonSecuredRoutes.some(route => url.includes(route));
  }

  /**
   * Adds the Authorization token to the request headers.
   *
   * @param request - The HTTP request.
   * @param token - Optional token parameter to be used instead of the one from local storage.
   * @returns HttpRequest<any> - The modified HTTP request.
   */
  private addAuthorizationTokenHeader(request: HttpRequest<unknown>, token?: string): HttpRequest<any> {
    const authToken: string = token || localStorage.getItem(Key.TOKEN);
    return request.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } });
  }

  /**
   * Checks if the error is due to an expired token.
   *
   * @param error - The HTTP error response.
   * @returns boolean - True if the error is due to an expired token, otherwise false.
   */
  private isTokenExpiredError(error: HttpErrorResponse): boolean {
    return error instanceof HttpErrorResponse && error.status === 401 && error.error.reason.includes('expired');
  }

  /**
   * Waits for the token refresh to complete before retrying the original request.
   *
   * @param request - The original HTTP request.
   * @param next - The HTTP handler for the next interceptor or the backend.
   * @returns Observable<HttpEvent<unknown>> - Observable for handling the HTTP event after token refresh.
   */
  private waitForTokenRefresh(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.refreshTokenSubject.pipe(
      filter(response => response !== null),
      take(1),
      switchMap((response) => {
        return next.handle(this.addAuthorizationTokenHeader(request, response.data.access_token));
      })
    );
  }
}
