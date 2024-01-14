
import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpEvent, HttpHeaders, HttpParams} from "@angular/common/http";
import {HomePageResponse} from "../interface/home-page-response";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CentersPageResponse} from "../interface/centers-page-response";
import {RecyclingCenter} from "../interface/recycling-center";
import {CenterNewResponse} from "../interface/center-new-response";
import {CenterDetailsResponse} from "../interface/center-details-response";
import {NgForm} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class CenterService {

  private readonly server: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  centerDetails$ = (centerId: number) => <Observable<CustomHttpResponse<CenterDetailsResponse>>>
    this.http.get<CustomHttpResponse<CenterDetailsResponse>>
    (`${this.server}/centers/get/${centerId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  update$ = (center: NgForm) => <Observable<CustomHttpResponse<CenterDetailsResponse>>>
    this.http.put<CustomHttpResponse<CenterDetailsResponse>>
    (`${this.server}/centers/update`, center)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  centers$ = (page: number = 0): Observable<CustomHttpResponse<CentersPageResponse>> =>
    this.http.get<CustomHttpResponse<CentersPageResponse>>
    (`${this.server}/centers/list-all?page=${page}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  centersNearUser$(page: number = 0,
                   sortBy: string = '',
                   sortOrder: string = ''
  ): Observable<CustomHttpResponse<HomePageResponse>> {

    const params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('page', page.toString());

    return this.http.get<CustomHttpResponse<HomePageResponse>>
    (`${this.server}/centers/list-nearby`, {params})
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );
  }


  searchCenters$(name: string = '',
                 county: string = '',
                 city: string = '',
                 materials: string = '',
                 sortBy: string = '',
                 sortOrder: string = '',
                 page: number = 0
  ): Observable<CustomHttpResponse<CentersPageResponse>> {

    const params = new HttpParams()
      .set('name', name)
      .set('county', county)
      .set('city', city)
      .set('materials', materials)
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('page', page.toString());

    return this.http.get<CustomHttpResponse<CentersPageResponse>>
    (`${this.server}/centers/search`, {params})
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );
  }

  create$ = (center: NgForm) => <Observable<CustomHttpResponse<CenterNewResponse>>>
    this.http.post<CustomHttpResponse<CenterNewResponse>>
    (`${this.server}/centers/create`, center)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  contribute$ = (form: NgForm) => <Observable<CustomHttpResponse<CenterDetailsResponse>>>
    this.http.post<CustomHttpResponse<CenterNewResponse>>
    (`${this.server}/centers/contribute`, form)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  isCenterOpen(center: RecyclingCenter): boolean {
    if (center.alwaysOpen) {
      return true;
    }

    const currentDateTime = new Date();
    const openingTime = new Date(currentDateTime.toDateString() + ' ' + center.openingHour);
    const closingTime = new Date(currentDateTime.toDateString() + ' ' + center.closingHour);

    return currentDateTime >= openingTime && currentDateTime <= closingTime;
  }

  downloadReport$ = () => <Observable<HttpEvent<Blob>>>
    this.http.get(`${this.server}/centers/download/report`,
      { reportProgress: true, observe: 'events', responseType: 'blob' })
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
