import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CustomHttpResponse} from "../interface/custom-http-response";
import {CentersPageResponse} from "../interface/centers-page-response";
import {VouchersPageResponse} from "../interface/vouchers-page-response";
import {VoucherDetailsResponse} from "../interface/voucher-details-response";

@Injectable({
  providedIn: 'root'
})
export class VoucherService {

  private readonly server: string = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  searchVouchers$(
    code: string = '',
    sortBy: string = '',
    sortOrder: string = '',
    page: number = 0,
    redeemed: boolean | null,
    expired: boolean | null,
  ): Observable<CustomHttpResponse<VouchersPageResponse>> {
    let params = new HttpParams()
      .set('code', code)
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('page', page.toString());

    if (redeemed !== null) {
      params = params.set('redeemed', redeemed.toString());
    }

    if (expired !== null) {
      params = params.set('expired', expired.toString());
    }

    console.log(redeemed)
    console.log(expired)

    console.log(params)

    return this.http.get<CustomHttpResponse<VouchersPageResponse>>(
      `${this.server}/vouchers/search`,
      { params }
    ).pipe(
      tap(console.log),
      catchError(this.handleError)
    );
  }

  voucher$ = (code: string) => <Observable<CustomHttpResponse<VoucherDetailsResponse>>>
    this.http.get<CustomHttpResponse<VoucherDetailsResponse>>
    (`${this.server}/vouchers/get/${code}`)
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
