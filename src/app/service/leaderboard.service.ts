import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {CentersPageResponse} from "../interface/centers-page-response";
import {LeaderboardPageResponse} from "../interface/leaderboard-page-response";
import {environment} from "../../environments/environment.dev";

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  private readonly server: string = environment.API_BASE_URL;
  // private readonly server: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  leaderboard$(county: string = '',
               sortBy: string = '',
               sortOrder: string = '',
               page: number = 0
  ): Observable<CustomHttpResponse<LeaderboardPageResponse>> {

    const params = new HttpParams()
      .set('county', county)
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('page', page.toString());

    console.log(params)

    return this.http.get<CustomHttpResponse<LeaderboardPageResponse>>
    (`${this.server}/leaderboard`, {params})
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );
  }

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
