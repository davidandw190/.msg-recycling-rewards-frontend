import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap
} from "rxjs";
import {AppState} from "../../../interface/app-state";
import {DataState} from 'src/app/enum/data-state.enum';
import {CustomHttpResponse} from "../../../interface/custom-http-response";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Sort} from "@angular/material/sort";

import {VouchersPageResponse} from "../../../interface/vouchers-page-response";
import {VoucherService} from "../../../service/voucher.service";
import {Voucher} from "../../../interface/voucher";
import {ClipboardService} from "ngx-clipboard";
import {VoucherGuidelinesComponent} from "../../guidelines/voucher-guidelines/voucher-guidelines.component";
import {MatDialog} from "@angular/material/dialog";
import {NotificationService} from "../../../service/notification.service";

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VouchersComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  vouchersState$: Observable<AppState<CustomHttpResponse<VouchersPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<VouchersPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  currentPage: number = 0;

  readonly DataState = DataState;

  searchForm: FormGroup;



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private voucherService: VoucherService,
    private formBuilder: FormBuilder,
    private clipboardService: ClipboardService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeSearch()
    this.searchVouchers()
    this.setupSearchObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateActiveTab(activeTab: string): void {
    let redeemed: boolean | null = null;
    let expired: boolean | null = null;

    switch (activeTab) {
      case 'Redeemed':
        redeemed = true;
        break;
      case 'Expired':
        expired = true;
        break;
      case 'Available':
        redeemed = false;
        expired = false;
        break;
      case 'All Vouchers':
        break;

      default:
        break;
    }

    this.searchForm.get('redeemed').setValue(redeemed);
    this.searchForm.get('expired').setValue(expired);

    this.searchVouchers();
  }

  searchVouchers(): void {

    const { code, sortBy, sortOrder } = this.searchForm.value;
    const page = this.currentPageSubject.value;
    const { redeemed, expired } = this.searchForm.value;

    this.isLoadingSubject.next(true);

    this.voucherService
      .searchVouchers$(code, sortBy, sortOrder, page, redeemed, expired)
      .pipe(
        tap((response) => this.dataSubject.next(response)),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  searchVouchersSubmit(event: Event): void {

    event.preventDefault();
    const { code, sortBy, sortOrder } = this.searchForm.value;
    const page = this.currentPageSubject.value;
    const { redeemed, expired } = this.searchForm.value;

    this.isLoadingSubject.next(true);

    this.voucherService
      .searchVouchers$(code, sortBy, sortOrder, page, redeemed, expired)
      .pipe(
        tap((response) => this.dataSubject.next(response)),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  goToPage(pageNumber?: number): void {
    const { code, sortBy, sortOrder, redeemed, expired } = this.searchForm.value;

    this.isLoadingSubject.next(true);

    this.voucherService
      .searchVouchers$(code, sortBy, sortOrder, pageNumber - 1, redeemed, expired)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
          this.currentPageSubject.next(pageNumber - 1);
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  sort(event: Sort): void {
    const currentSortBy = this.searchForm.get('sortBy').value;
    const currentSortOrder = this.searchForm.get('sortOrder').value;

    const newSortOrder = currentSortBy === event.active ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

    this.searchForm.get('sortBy').setValue(event.active, { emitEvent: true });
    this.searchForm.get('sortOrder').setValue(newSortOrder, { emitEvent: true });

    this.searchVouchers();
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

  redirectNewCenter() {
    this.router.navigate(["/centers/new"])
  }


  private initializeForm(): void {
    this.searchForm = this.formBuilder.group({
      code: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc'],
      redeemed: [false],
      expired: [false],
    });
  }

  private initializeSearch(): void {
    this.vouchersState$ = this.dataSubject.pipe(
      map((response) => ({ dataState: DataState.LOADED, appData: response })),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );
  }

  private setupSearchObservable(): void {
    this.searchForm.get('code').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(() =>
          this.voucherService.searchVouchers$(
            this.searchForm.get('code').value,
            this.searchForm.get('sortBy').value,
            this.searchForm.get('sortOrder').value,
            0,
            this.searchForm.get('redeemed').value,
            this.searchForm.get('expired').value
          )
        ),
        catchError((error: string) => {
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        }),
        tap((response) => this.handleSearch(response)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    combineLatest([
      this.searchForm.valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('code').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('sortBy').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('sortOrder').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('redeemed').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('expired').valueChanges.pipe(debounceTime(100), distinctUntilChanged())
    ])
      .pipe(
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(([code, sortBy, sortOrder, redeemed, expired]) =>
          this.voucherService.searchVouchers$(code, sortBy, sortOrder, 0, redeemed, expired)
        ),
        catchError((error: string) => {
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => this.handleSearch(response));
  }


  private handleSearch(response: any): void {
    this.dataSubject.next(response);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        code: this.searchForm.get('code').value,
        redeemed: this.searchForm.get('redeemed').value,
        expired: this.searchForm.get('expired').value,
      },
      queryParamsHandling: 'merge',
    });
  }

  isVoucherRedeemable(voucher: Voucher): boolean {
    return !voucher.redeemed && (!voucher.expiresAt || new Date(voucher.expiresAt) >= new Date());
  }

  copyToClipboard(code: string) {
    this.clipboardService.copyFromContent(code);
    this.notification.onDefault("Voucher Code copied to clipboard.")
  }

  // getActiveTab(): string {
  //   return this.updateActiveTab()
  // }
}
