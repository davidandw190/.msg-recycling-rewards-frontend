import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {HomePageResponse} from "../interface/home-page-response";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CentersPageResponse} from "../interface/centers-page-response";

@Injectable({
  providedIn: 'root'
})
export class CenterService {
  private readonly server: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  centers$ = (page: number = 0): Observable<CustomHttpResponse<HomePageResponse>> =>
    this.http.get<CustomHttpResponse<HomePageResponse>>
    (`${this.server}/centers/list-all?page=${page}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  searchCenters$(name: string = '', county: string = '', city: string = '', materials: string = '', page: number = 0): Observable<CustomHttpResponse<CentersPageResponse>> {
    const params = new HttpParams()
      .set('name', name)
      .set('county', county)
      .set('city', city)
      .set('materials', materials)
      .set('page', page.toString());

    return this.http.get<CustomHttpResponse<CentersPageResponse>>(`${this.server}/centers/search`, { params })
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
