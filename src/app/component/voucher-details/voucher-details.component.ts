import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, startWith, Subject, switchMap, takeUntil} from "rxjs";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {VoucherDetailsResponse} from "../../interface/voucher-details-response";
import { AppState } from 'src/app/interface/app-state';
import {ActivatedRoute, ParamMap} from "@angular/router";
import { DataState } from 'src/app/enum/data-state.enum';
import {VoucherService} from "../../service/voucher.service";
import {VoucherStatusPipe} from "../../pipes/voucher-status.pipe";
import {jsPDF} from 'jspdf';

const VOUCHER_CODE: string = 'code';

@Component({
  selector: 'app-voucher-details',
  templateUrl: './voucher-details.component.html',
  styleUrls: ['./voucher-details.component.css']
})
export class VoucherDetailsComponent implements OnInit, OnDestroy {
  voucherDetailsState$: Observable<AppState<CustomHttpResponse<VoucherDetailsResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<VoucherDetailsResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  readonly DataState = DataState;

  voucherStatus: string;
  currentVoucherCode: string;

  private destroy$ = new Subject<void>();

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
              this.voucherStatus = this.voucherStatusPipe.transform(response.data.voucher, false, true);
              this.currentVoucherCode = response.data.voucher.uniqueCode;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  redeem() {
    this.isLoadingSubject.next(true);

    this.voucherService.redeem$(this.currentVoucherCode).pipe(
      switchMap(() => this.voucherService.voucher$(this.currentVoucherCode)),
      map((response) => {
        console.log(response);
        this.isLoadingSubject.next(false);
        this.voucherStatus = this.voucherStatusPipe.transform(response.data.voucher, false, true);
        this.currentVoucherCode = response.data.voucher.uniqueCode;
        return { dataState: DataState.LOADED, appData: response };
      }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        return of({ dataState: DataState.ERROR, error });
      }),
      takeUntil(this.destroy$)
    ).subscribe((result) => {
      this.voucherDetailsState$ = of(result);
    });
  }

  exportAsPDF(): void {
    const filename = `voucher-${this.dataSubject.value.data['voucher'].voucherType.name }-${this.dataSubject.value.data['voucher'].uniqueCode}.pdf`;
    const doc = new jsPDF();
    doc.html(document.getElementById('voucher-pane'), { margin: 2, windowWidth: 1000, width: 200,
      callback: (voucher) => voucher.save(filename) });
  }

}
