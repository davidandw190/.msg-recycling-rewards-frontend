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
  switchMap, tap
} from "rxjs";
import {AppState} from "../../interface/app-state";
import {DataState} from "../../enum/data-state.enum";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {CentersPageResponse} from "../../interface/centers-page-response";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {CenterService} from "../../service/center.service";
import {FormBuilder, FormGroup, NgForm} from "@angular/forms";

@Component({
  selector: 'app-center-all',
  templateUrl: './center-all.component.html',
  styleUrls: ['./center-all.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CenterAllComponent implements OnInit{
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
        tap(() => this.isLoadingSubject.next(false)),
        switchMap(() => this.centerService.searchCenters$(this.searchForm.get('name').value)),
        catchError((error: string) => {
          // Handle error appropriately, e.g., show a user-friendly message
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        }),
        tap(() => this.isLoadingSubject.next(false))
      )
      .subscribe(response => {
        console.log(response);
        // @ts-ignore
        this.dataSubject.next(response);
      });
  }

  private handleSearch(searchObservable: Observable<any>): void {
    searchObservable.pipe(
      map(response => {
        console.log(response);
        this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response };
      }),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error })),
      tap(() => this.isLoadingSubject.next(false))
    ).subscribe(response => {
      this.centersState$ = of(response);
    });
  }


  private initializeSearch(): void {
    this.centersState$ = this.dataSubject.pipe(
      map(response => ({ dataState: DataState.LOADED, appData: response })),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );
  }

  searchCenters(): void {
    const name = this.searchForm.get('name').value;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name: name || null },
      queryParamsHandling: 'merge',
    });

    this.isLoadingSubject.next(true);

    this.centersState$ = this.centerService.searchCenters$(name).pipe(
      map(response => {
        console.log(response);
        this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response };
      }),
      startWith({dataState: DataState.LOADED}),
      catchError((error: string) => of({ dataState: DataState.ERROR, error })),
      tap(() => this.isLoadingSubject.next(false))
    );
  }

  goToPage(pageNumber?: number): void {
    const name = this.searchForm.get('name').value;

    this.isLoadingSubject.next(true);

    this.centersState$ = this.centerService.searchCenters$(name, pageNumber - 1).pipe(
      map(response => {
        console.log(response);
        this.dataSubject.next(response);
        this.currentPageSubject.next(pageNumber - 1);
        return { dataState: DataState.LOADED, appData: response };
      }),
      startWith({dataState: DataState.LOADED}),
      catchError((error: string) => of({ dataState: DataState.ERROR, error })),
      tap(() => this.isLoadingSubject.next(false))
    );
  }
}
