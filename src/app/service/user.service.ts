import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {Profile} from "../interface/profile";
import {Key} from "../enum/key.enum";
import {User} from "../interface/user";
import {JwtHelperService} from "@auth0/angular-jwt";
import {AccountType} from "../interface/account-type";
import {environment} from "../../environments/environment.dev";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly server: string = environment.API_BASE_URL;
  // private readonly server: string = 'http://localhost:8080';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  /**
   * Checks if the user is authenticated based on the presence and validity of the JWT token.
   * @returns {boolean} True if the user is authenticated; otherwise, false.
   */
  isAuthenticated = (): boolean => (
    this.jwtHelper.decodeToken<string>(localStorage.getItem(Key.TOKEN)) &&
    !this.jwtHelper.isTokenExpired(localStorage.getItem(Key.TOKEN))
  );

  /**
   * Logs out the user by removing the authentication tokens from the local storage.
   * @method
   */
  logOut() {
    localStorage.removeItem(Key.TOKEN);
    localStorage.removeItem(Key.REFRESH_TOKEN);
  }

  /**
   * Logs in a user by sending a POST request to the server with provided email and password.
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @returns {Observable<CustomHttpResponse<Profile>>} Observable containing server response.
   */
  login$ = (email: string, password: string): Observable<CustomHttpResponse<Profile>> => <Observable<CustomHttpResponse<Profile>>>
    this.http.post<CustomHttpResponse<Profile>>
    (`${this.server}/user/login`, { email: email, password: password })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  register$ = (user: User) => <Observable<CustomHttpResponse<Profile>>>
    this.http.post<CustomHttpResponse<Profile>>
    (`${this.server}/user/register`, user)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  verify$ = (key: string, type: AccountType) => <Observable<CustomHttpResponse<Profile>>>
    this.http.get<CustomHttpResponse<Profile>>
    (`${this.server}/user/verify/${type}/${key}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  requestPasswordReset$ = (email: string) => <Observable<CustomHttpResponse<Profile>>>
    this.http.get<CustomHttpResponse<Profile>>
    (`${this.server}/user/reset-pass/${email}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  /**
   * Verifies a user's code by sending a GET request to the server with email and code parameters.
   * @param {string} email - User's email address.
   * @param {string} code - Verification code.
   * @returns {Observable<CustomHttpResponse<Profile>>} Observable containing server response.
   */
  verifyLoginCode$ = (email: string, code: string): Observable<CustomHttpResponse<Profile>> => <Observable<CustomHttpResponse<Profile>>>
    this.http.get<CustomHttpResponse<Profile>>
    (`${this.server}/user/verify/code/${email}/${code}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );


  profile$ = () => <Observable<CustomHttpResponse<Profile>>>
    this.http.get<CustomHttpResponse<Profile>>
    (`${this.server}/user/profile`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  user$ = () => <Observable<CustomHttpResponse<User>>>
    this.http.get<CustomHttpResponse<User>>
    (`${this.server}/user`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  updateUser$ = (user: User) => <Observable<CustomHttpResponse<Profile>>>
    this.http.patch<CustomHttpResponse<Profile>>
    (`${this.server}/user/update`, user)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  updateUserPassword$ = (form: { currentPassword: string, newPassword: string, confirmNewPassword: string }) => <Observable<CustomHttpResponse<Profile>>>
    this.http.patch<CustomHttpResponse<Profile>>
    (`${this.server}/user/update/password`, form)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  updateUserRoles$ = (roleName: string) => <Observable<CustomHttpResponse<Profile>>>
    this.http.patch<CustomHttpResponse<Profile>>
    (`${this.server}/user/update/role/${roleName}`, {})
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  updateUserAccountSettings$ = (settings: { enabled: boolean, notLocked: boolean }) => <Observable<CustomHttpResponse<Profile>>>
    this.http.patch<CustomHttpResponse<Profile>>
    (`${this.server}/user/update/settings`, settings)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  toggleMfa$ = () => <Observable<CustomHttpResponse<Profile>>>
    this.http.patch<CustomHttpResponse<Profile>>
    (`${this.server}/user/toggle-mfa`, {})
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  toggleNotifications$ = () => <Observable<CustomHttpResponse<Profile>>>
    this.http.patch<CustomHttpResponse<Profile>>
    (`${this.server}/user/toggle-notifications`, {})
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  refreshToken$ = () => <Observable<CustomHttpResponse<Profile>>>
    this.http.get<CustomHttpResponse<Profile>>
    (`${this.server}/user/refresh/token`, { headers: { Authorization: `Bearer ${localStorage.getItem(Key.REFRESH_TOKEN)}` } })
      .pipe(
        tap(response => {
          console.log(response);
          localStorage.removeItem(Key.TOKEN);
          localStorage.removeItem(Key.REFRESH_TOKEN);
          localStorage.setItem(Key.TOKEN, response.data.access_token);
          localStorage.setItem(Key.REFRESH_TOKEN, response.data.refresh_token);
        }),

        catchError(this.handleError)
      );

  updateUserProfilePicture$ = (picture: FormData) => <Observable<CustomHttpResponse<Profile>>>
    this.http.patch<CustomHttpResponse<Profile>>
    (`${this.server}/user/update/profile-pic`, picture)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  resetPasswordExternally$ = (form: { userId: number, password: string, confirmPassword: string }) => <Observable<CustomHttpResponse<Profile>>>
    this.http.put<CustomHttpResponse<Profile>>
    (`${this.server}/user/new/password`, form)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );
  /**
   * Handles HTTP errors and logs them. Converts the error into an observable with an error message.
   * @param {HttpErrorResponse} error - HTTP error response.
   * @returns {Observable<never>} Observable containing an error message.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `A client error occurred - ${error.error.message}`;
    } else {
      if (error.error.reason) {
        errorMessage = error.error.reason;
        console.log(errorMessage);
      } else {
        errorMessage = `An error occurred - Error status ${error.status}`;
      }
    }
    return throwError(() => errorMessage);
  }

}
