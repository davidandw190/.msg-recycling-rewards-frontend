import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
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
import {LeaderboardPageResponse} from "../../interface/leaderboard-page-response";
import {LeaderboardService} from "../../service/leaderboard.service";
import {LocationService} from "../../service/location.service";
import {NotificationService} from "../../service/notification.service";

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  leaderboardState$: Observable<AppState<CustomHttpResponse<LeaderboardPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<LeaderboardPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  currentPage: number = 0;

  readonly DataState = DataState;

  counties: string[] = this.locationService.getAllCounties();

  countyFilterApplied: boolean = false;

  chosenCountyForFilter: string;

  searchForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private leaderboardService: LeaderboardService,
    private formBuilder: FormBuilder,
    private notification: NotificationService
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
    this.leaderboardState$ = this.dataSubject.pipe(
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
        switchMap((selectedCounty) => {
          // to check if the selectedCounty is a valid county from the options
          if (this.counties.includes(selectedCounty)) {
            this.notification.onDefault("Leaderboard for " + selectedCounty + " retrieved successfully.");
            return this.leaderboardService.leaderboard$(
              selectedCounty,
              this.searchForm.get('sortBy').value,
              this.searchForm.get('sortOrder').value,
              0,
            );

          }  else if (!selectedCounty) {
            // If county field is empty, trigger search with an empty county
            return this.leaderboardService.leaderboard$(
              '',  // Pass an empty county to trigger the search
              this.searchForm.get('sortBy').value,
              this.searchForm.get('sortOrder').value,
              0,
            );

          } else {
            // if not a valid county, we return an empty observable
            return of(null);
          }
        }),
        filter(response => response !== null), // to filter out the null response
        catchError((error: string) => {
          console.error(error);
          this.notification.onError(error);
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

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((queryParams) => {
        this.countyFilterApplied = queryParams['county'] && this.counties.includes(queryParams['county']);
        this.chosenCountyForFilter = queryParams['county'];
      });
  }

  private handleSearch(response: any): void {
    this.dataSubject.next(response);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        county: this.searchForm.get('county').value
      },
      queryParamsHandling: 'merge',
    });
  }

}
