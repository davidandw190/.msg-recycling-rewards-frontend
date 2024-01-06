import {Component} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap
} from "rxjs";
import {AppState} from "../../interface/app-state";
import {DataState} from 'src/app/enum/data-state.enum';
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Sort} from "@angular/material/sort";
import {VouchersPageResponse} from "../../interface/vouchers-page-response";
import {VoucherService} from "../../service/voucher.service";

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.css']
})
export class VouchersComponent {
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

  isFiltersCollapsed = true;

  numEnabledFilters: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private voucherService: VoucherService,
    private formBuilder: FormBuilder
  ) {
    this.initializeForm();
    this.initializeSearch()
  }

  ngOnInit(): void {
    this.setupFormChangeListeners();
    this.setupKeyEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.searchForm = this.formBuilder.group({
      code: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc'],
      redeemed: [false],
      expired: [false],
    });

    // this.searchForm.get('redeemed').setValue(false);
    // this.searchForm.get('expired').setValue(false);
  }

  private setupFormChangeListeners(): void {

    this.searchVouchers();

    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true))
      )
      .subscribe();

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
        tap((response) => this.handleSearch(response))
      )
      .subscribe();

    this.searchForm.get('sortBy').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(() => this.searchVouchers()), // Trigger search when the sorting changes
        filter(() => false) // Prevent reactive changes
      )
      .subscribe();

    this.searchForm.get('sortOrder').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(() => this.searchVouchers()), // Trigger search when the sorting changes
        filter(() => false) // Prevent reactive changes
      )
      .subscribe();
  }

  private setupKeyEventListeners(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((event) => event.key === 'Enter'),
        filter(() => this.searchForm.valid)
      )
      .subscribe(() => this.searchVouchers());
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

  private initializeSearch(): void {
    this.vouchersState$ = this.dataSubject.pipe(
      map((response) => ({ dataState: DataState.LOADED, appData: response })),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );
  }

  toggleFilters() {
    this.isFiltersCollapsed = !this.isFiltersCollapsed;
  }

  searchVouchers(): void {
    const code = this.searchForm.get('code').value;
    const sortBy = this.searchForm.get('sortBy').value;
    const sortOrder = this.searchForm.get('sortOrder').value;
    const page = this.currentPageSubject.value;

    // Retrieve redeemed and expired values
    const redeemed = this.searchForm.get('redeemed').value;
    const expired = this.searchForm.get('expired').value;



    // Create an object to hold non-null parameters
    const queryParams: any = {
      code,
      sortBy,
      sortOrder,
      page,
      redeemed,
      expired,
    };

    // // Add redeemed and expired to queryParams if they are not null
    // if (redeemed !== null) {
    //   queryParams.redeemed = redeemed;
    // }
    //
    // if (expired !== null) {
    //   queryParams.expired = expired;
    // }

    // this.updateEnabledFilters();
    this.isLoadingSubject.next(true);

    console.log('redeemed:', redeemed);
    console.log('expired:', expired);

    console.log('redeemed:', queryParams.redeemed);
    console.log('expired:', queryParams.expired);

    this.voucherService
      .searchVouchers$(code, sortBy, sortOrder, page, redeemed, expired)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }




  goToPage(pageNumber?: number): void {
    const code  = this.searchForm.get('code').value;
    const sortBy  = this.searchForm.get('sortBy').value;
    const sortOrder  = this.searchForm.get('sortOrder').value;
    const redeemed  = this.searchForm.get('redeemed').value;
    const expired  = this.searchForm.get('expired').value;
    // console.log(materials)

    this.isLoadingSubject.next(true);

    this.voucherService
      .searchVouchers$( code, sortBy, sortOrder, pageNumber - 1, redeemed, expired)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
          this.currentPageSubject.next(pageNumber - 1);
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }


  private updateSearch(): void {
    this.isLoadingSubject.next(true);
    this.searchVouchers();
  }

  redirectNewCenter() {
    this.router.navigate(["/centers/new"])
  }


  sort(event: Sort): void {
    const currentSortBy = this.searchForm.get('sortBy').value;
    const currentSortOrder = this.searchForm.get('sortOrder').value;

      // Toggle the sorting order when the same column is clicked
      const newSortOrder = currentSortBy === event.active ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

      this.searchForm.get('sortBy').setValue(event.active, { emitEvent: true });
      this.searchForm.get('sortOrder').setValue(newSortOrder, { emitEvent: true });


    this.searchVouchers();
  }


  updateActiveTab(activeTab: string) {

    if (activeTab === 'Available') {
      this.searchForm.get('redeemed').setValue(false);
      this.searchForm.get('expired').setValue(false);

    } else if (activeTab === 'Redeemed') {
      this.searchForm.get('redeemed').setValue(false);
      this.searchForm.get('expired').setValue(null);
    } else if (activeTab === 'Expired'){
      this.searchForm.get('redeemed').setValue(null);
      this.searchForm.get('expired').setValue(true);
    }

    console.log(this.searchForm.get('expired').value)
    console.log(this.searchForm.get('redeemed').value)

    this.searchVouchers()

  }
}
