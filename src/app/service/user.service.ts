import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {Profile} from "../interface/profile";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly server: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  /**
   * Logs in a user by sending a POST request to the server with provided email and password.
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @returns {Observable<CustomHttpResponse<Profile>>} Observable containing server response.
   */
  login$ = (email: string, password: string): Observable<CustomHttpResponse<Profile>> => <Observable<CustomHttpResponse<Profile>>>
    this.http.post<CustomHttpResponse<Profile>>(`${this.server}/user/login`, { email: email, password: password })
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
