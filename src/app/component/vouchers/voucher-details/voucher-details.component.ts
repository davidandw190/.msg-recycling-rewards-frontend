import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, startWith, Subject, switchMap, takeUntil, tap} from "rxjs";
import {CustomHttpResponse} from "../../../interface/custom-http-response";
import {VoucherDetailsResponse} from "../../../interface/voucher-details-response";
import {AppState} from 'src/app/interface/app-state';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {DataState} from 'src/app/enum/data-state.enum';
import {VoucherService} from "../../../service/voucher.service";
import {VoucherStatusPipe} from "../../../pipes/voucher-status.pipe";
import {jsPDF} from 'jspdf';
import html2canvas from "html2canvas";
import {MatDialog} from "@angular/material/dialog";
import {VoucherGuidelinesComponent} from "../../guidelines/voucher-guidelines/voucher-guidelines.component";
import {NotificationService} from "../../../service/notification.service";

const VOUCHER_CODE: string = 'code';

@Component({
  selector: 'app-voucher-details',
  templateUrl: './voucher-details.component.html',
  styleUrls: ['./voucher-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    private voucherStatusPipe: VoucherStatusPipe,
    private dialog: MatDialog,
    private notification: NotificationService
  ) { }


  ngOnInit(): void {
    this.voucherDetailsState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.voucherService.voucher$(params.get(VOUCHER_CODE))
          .pipe(
            map(response => {
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
      map((response) => this.notification.onSuccess(response.message)),
      switchMap(() => this.voucherService.voucher$(this.currentVoucherCode)),
      map((response) => {
        console.log(response);
        this.isLoadingSubject.next(false);
        this.voucherStatus = this.voucherStatusPipe.transform(response.data.voucher, false, true);
        this.currentVoucherCode = response.data.voucher.uniqueCode;
        return { dataState: DataState.LOADED, appData: response };
      }),
      catchError((error: string) => {
        this.notification.onError(error)
        this.isLoadingSubject.next(false);
        return of({ dataState: DataState.ERROR, error });
      }),
      takeUntil(this.destroy$)
    ).subscribe((result) => {
      this.voucherDetailsState$ = of(result);
    });
  }

  exportAsPDF(): void {
    const filename = `voucher-${this.dataSubject.value.data['voucher'].voucherType.name }-#${this.dataSubject.value.data['voucher'].uniqueCode}.pdf`;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    const img = new Image();
    img.src = 'assets/msg-logo.png';
    doc.setFont('fa-solid-900', 'normal');
    doc.addImage(img, 'png', 10, 78, 12, 15);

    const voucherElement = document.getElementById('voucher-pane');

    if (voucherElement) {
      html2canvas(voucherElement, { scale: 2 }).then((canvas) => {
        const imageData = canvas.toDataURL('image/png');
        doc.addImage(imageData, 'PNG', 10, 15, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 80);

        doc.save(filename);
      });

      this.notification.onSuccess("Voucher exported successfully.")
    }
  }

  openVoucherGuidelines() {
    this.voucherService
      .voucherTypes$()
      .pipe(
        tap((response) => {
          const dialogRef = this.dialog.open(VoucherGuidelinesComponent, {
            data: {
              voucherTypes: response.data.availableVoucherTypes,
            },
          });
        }),
        catchError((error: string) => {
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        })
      )
      .subscribe();

  }
}
