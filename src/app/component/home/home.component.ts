import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {HomePageResponse} from "../../interface/home-page-response";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {DataState} from 'src/app/enum/data-state.enum';
import {AppState} from "../../interface/app-state";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith, switchMap,
  tap
} from "rxjs";
import {Router} from "@angular/router";
import {CenterService} from "../../service/center.service";
import {RecyclingCenter} from "../../interface/recycling-center";
import {Sort} from "@angular/material/sort";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  homeState$: Observable<AppState<CustomHttpResponse<HomePageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<HomePageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  currentPage: number = 0

  readonly DataState = DataState;

  tableFilterForm: FormGroup;

  sortBy: string = 'createdAt';
  sortOrder: string = 'asc';


  constructor(
    private router: Router,
    private centerService: CenterService,
    private formBuilder: FormBuilder
  ) {

    this.tableFilterForm = this.formBuilder.group({
      sortBy: ['createdAt'],
      sortOrder: ['asc'],
    });
  }

  ngOnInit(): void {
    this.initializeSearch();

    this.tableFilterForm.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(() => of(this.searchCenters()))
      )
      .subscribe();

    this.searchCenters();
  }

  private initializeSearch(): void {
    this.homeState$ = this.dataSubject.pipe(
      map((response) => ({ dataState: DataState.LOADED, appData: response })),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );
  }

  searchCenters(): void {
    const page = this.currentPageSubject.value;
    const sortBy = this.tableFilterForm.get('sortBy').value;
    const sortOrder = this.tableFilterForm.get('sortOrder').value;

    this.isLoadingSubject.next(true);

    this.centerService
      .centersNearUser$(page, sortBy, sortOrder)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
        }),
        startWith({dataState: DataState.LOADING }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  goToPage(pageNumber?: number): void {
    const sortBy  = this.tableFilterForm.get('sortBy').value;
    const sortOrder  = this.tableFilterForm.get('sortOrder').value;

    this.isLoadingSubject.next(true);

    this.centerService
      .centersNearUser$(pageNumber-1, sortBy, sortOrder )
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
          this.currentPageSubject.next(pageNumber-1);
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  sort(event: Sort): void {
    const currentSortBy = this.tableFilterForm.get('sortBy').value;
    const currentSortOrder = this.tableFilterForm.get('sortOrder').value;

    if (event.active === 'materials') {
      const newSortBy = 'acceptedMaterials';

      const newSortOrder = currentSortBy === newSortBy ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

      this.tableFilterForm.get('sortBy').setValue(newSortBy, { emitEvent: true });
      this.tableFilterForm.get('sortOrder').setValue(newSortOrder, { emitEvent: true });

    } else {
      const newSortOrder = currentSortBy === event.active ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

      this.tableFilterForm.get('sortBy').setValue(event.active, { emitEvent: true });
      this.tableFilterForm.get('sortOrder').setValue(newSortOrder, { emitEvent: true });
    }
    this.searchCenters();
  }


  navigateToCreateCenter() {
    this.router.navigate(['/centers/new'])
  }

  navigateToCentersView() {
    this.router.navigate(['/centers/all'])
  }

  isCenterOpen(center: RecyclingCenter): boolean {
    return this.centerService.isCenterOpen(center);
  }

  trackByCenter(index: number, center: RecyclingCenter): number {
    return center.centerId;
  }
}
