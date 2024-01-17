import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {AppState} from "../../interface/app-state";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DataState} from '../../enum/data-state.enum';
import {ActivatedRoute, Router} from "@angular/router";
import {Sort} from "@angular/material/sort";
import {Voucher} from "../../interface/voucher";
import {LeaderboardPageResponse} from "../../interface/leaderboard-page-response";
import {LeaderboardService} from "../../service/leaderboard.service";

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  vouchersState$: Observable<AppState<CustomHttpResponse<LeaderboardPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<LeaderboardPageResponse>>(null);
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
    private leaderboardService: LeaderboardService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeSearch()
    this.getResults()
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

    this.getResults();
  }

  getResults(): void {
    const { county, sortBy, sortOrder } = this.searchForm.value;
    const page = this.currentPageSubject.value;

    this.isLoadingSubject.next(true);

    this.leaderboardService
      .leaderboard$(county, sortBy, sortOrder, page)
      .pipe(
        tap((response) => this.dataSubject.next(response)),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  goToPage(pageNumber?: number): void {
    const { county, sortBy, sortOrder} = this.searchForm.value;

    this.isLoadingSubject.next(true);

    this.leaderboardService
      .leaderboard$(county, sortBy, sortOrder, pageNumber - 1)
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

    this.getResults();
  }

  private initializeForm(): void {
    this.searchForm = this.formBuilder.group({
      county: [''],
      sortBy: ['rewardPoints'],
      sortOrder: ['desc'],
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
    this.searchForm.get('county').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(() =>
          this.leaderboardService.leaderboard$(
            this.searchForm.get('county').value,
            this.searchForm.get('sortBy').value,
            this.searchForm.get('sortOrder').value,
            0,
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
      this.searchForm.get('county').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('sortBy').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('sortOrder').valueChanges.pipe(debounceTime(100), distinctUntilChanged())
    ])
      .pipe(
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(([county, sortBy, sortOrder]) =>
          this.leaderboardService.leaderboard$(county, sortBy, sortOrder, 0)
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
}
