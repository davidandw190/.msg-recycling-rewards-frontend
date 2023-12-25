import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {AppState} from '../../interface/app-state';
import {DataState} from '../../enum/data-state.enum';
import {CustomHttpResponse} from '../../interface/custom-http-response';
import {CentersPageResponse} from '../../interface/centers-page-response';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {CenterService} from '../../service/center.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-center-all',
  templateUrl: './center-all.component.html',
  styleUrls: ['./center-all.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CenterAllComponent implements OnInit {
  centersState$: Observable<AppState<CustomHttpResponse<CentersPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CentersPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();
  currentPage: number = 0;
  searchQuery: string;

  readonly DataState = DataState;

  searchForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private centerService: CenterService,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      name: [''],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.searchQuery = params.get('name') || '';
      this.searchForm.setValue({ name: this.searchQuery });
      this.initializeSearch();
    });

    this.searchCenters();

    this.searchForm.get('name').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(() => this.centerService.searchCenters$(this.searchForm.get('name').value)),
        catchError((error: string) => {
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        }),
        tap((response) => this.handleSearch(response))
      )
      .subscribe();
  }

  private handleSearch(response: any): void {
    this.dataSubject.next(response);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name: this.searchForm.get('name').value },
      queryParamsHandling: 'merge',
    });
  }

  private initializeSearch(): void {
    this.centersState$ = this.dataSubject.pipe(
      map((response) => ({ dataState: DataState.LOADED, appData: response })),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );
  }

  searchCenters(): void {
    const name = this.searchForm.get('name').value;

    this.isLoadingSubject.next(true);

    this.centerService.searchCenters$(name).pipe(
      tap((response) => this.handleSearch(response)),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    ).subscribe();
  }

  goToPage(pageNumber?: number): void {
    const name = this.searchForm.get('name').value;

    this.isLoadingSubject.next(true);

    this.centerService.searchCenters$(name, pageNumber - 1).pipe(
      tap((response) => {
        this.dataSubject.next(response);
        this.currentPageSubject.next(pageNumber - 1);
      }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    ).subscribe();
  }
}
