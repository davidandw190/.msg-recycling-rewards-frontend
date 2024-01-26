import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {EcoLearnPageResponse} from "../interface/eco-learn-page-response";
import {NgForm} from "@angular/forms";
import {CenterNewResponse} from "../interface/center-new-response";
import {User} from "../interface/user";
import {ResourceNewPageResponse} from "../interface/resource-new-page-response";

@Injectable({
  providedIn: 'root'
})
export class EcoLearnService {
  private readonly server: string = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  search$(
    title: string = '',
    contentType: string = '',
    categories: string = '',
    likedOnly: boolean = false,
    savedOnly: boolean = false,
    sortBy: string = '',
    sortOrder: string = '',
    page: number = 0,
  ): Observable<CustomHttpResponse<EcoLearnPageResponse>> {
    let params = new HttpParams()
      .set('title', title)
      .set('contentType', contentType)
      .set('categories', categories)
      .set('likedOnly', likedOnly)
      .set('savedOnly', savedOnly)
      .set('sortOrder', sortOrder)
      .set('sortBy', sortBy)
      .set('page', page.toString());

    console.log(params)

    return this.http.get<CustomHttpResponse<EcoLearnPageResponse>>(
      `${this.server}/eco-learn/search`,
      { params }
    ).pipe(
      tap(console.log),
      catchError(this.handleError)
    );
  }

  fetchAvailableCategories$(): Observable<string[]> {
    return this.http.get<string[]>(`${this.server}/eco-learn/categories`).pipe(
      catchError(this.handleError)
    );
  }

  fetchAvailableContentTypes$(): Observable<string[]> {
    return this.http.get<string[]>(`${this.server}/eco-learn/content-types`).pipe(
      catchError(this.handleError)
    );
  }

  create$ = (date: FormData) => <Observable<CustomHttpResponse<ResourceNewPageResponse>>>
    this.http.post<CustomHttpResponse<ResourceNewPageResponse>>
    (`${this.server}/eco-learn/create`, date)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  fetchForCreate$ = () => <Observable<CustomHttpResponse<ResourceNewPageResponse>>>
    this.http.get<CustomHttpResponse<ResourceNewPageResponse>>
    (`${this.server}/eco-learn/create`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  engage$ = (resourceId: number, action: string) => <Observable<CustomHttpResponse<ResourceNewPageResponse>>>
    this.http.post<CustomHttpResponse<void>>
    (`${this.server}/eco-learn/engage/${action.toUpperCase()}/${resourceId}`, {})
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

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
