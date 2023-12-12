import {UserService} from "../service/user.service";
import {BehaviorSubject, catchError, Observable, switchMap, throwError} from "rxjs";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {Profile} from "../interface/profile";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Injectable} from "@angular/core";

/**
 * TokenInterceptor is responsible for adding authentication tokens to outgoing HTTP requests
 * and handling access token refresh when a 401 Unauthorized response is encountered due to an expired access token,
 * but the refresh token is still valid.
 */
@Injectable({ providedIn: "root"})
export class TokenInterceptor implements HttpInterceptor {
  private isTokenRefreshing: boolean = false;
  private refreshTokenSubject: BehaviorSubject<CustomHttpResponse<Profile>> = new BehaviorSubject(null);

  constructor(private userService: UserService) {
  }

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

  private isNonSecuredRoute(url: string) {
    return false;
  }

  private addAuthorizationTokenHeader(request: HttpRequest<unknown>) {
    return undefined;
  }

  private isTokenExpiredError(error: HttpErrorResponse) {
    return false;
  }

  private waitForTokenRefresh(request: HttpRequest<unknown>, next: HttpHandler) {
    return undefined;
  }
}
