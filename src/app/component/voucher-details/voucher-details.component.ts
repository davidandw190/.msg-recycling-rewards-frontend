import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, startWith, switchMap} from "rxjs";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {VoucherDetailsResponse} from "../../interface/voucher-details-response";
import { AppState } from 'src/app/interface/app-state';
import {ActivatedRoute, ParamMap} from "@angular/router";
import { DataState } from 'src/app/enum/data-state.enum';
import {VoucherService} from "../../service/voucher.service";
import {VoucherStatusPipe} from "../../pipes/voucher-status.pipe";

const VOUCHER_CODE: string = 'code';

@Component({
  selector: 'app-voucher-details',
  templateUrl: './voucher-details.component.html',
  styleUrls: ['./voucher-details.component.css']
})
export class VoucherDetailsComponent implements OnInit {
  voucherDetailsState$: Observable<AppState<CustomHttpResponse<VoucherDetailsResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<VoucherDetailsResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  readonly DataState = DataState;

  voucherStatus: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private voucherService: VoucherService,
    private voucherStatusPipe: VoucherStatusPipe
  ) { }

  ngOnInit(): void {
    this.voucherDetailsState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.voucherService.voucher$(params.get(VOUCHER_CODE))
          .pipe(
            map(response => {
              console.log(response);
              this.dataSubject.next(response);
              this.voucherStatus = this.voucherStatusPipe.transform(response.data.voucher, false, true)
              return { dataState: DataState.LOADED, appData: response };
            }),

            startWith({ dataState: DataState.LOADING }),

            catchError((error: string) => {
              return of({ dataState: DataState.ERROR, error })
            })
          )
      })
    );
  }
}
