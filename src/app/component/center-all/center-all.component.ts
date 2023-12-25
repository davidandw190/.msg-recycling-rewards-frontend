import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged, filter, fromEvent,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { AppState } from '../../interface/app-state';
import { DataState } from '../../enum/data-state.enum';
import { CustomHttpResponse } from '../../interface/custom-http-response';
import { CentersPageResponse } from '../../interface/centers-page-response';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CenterService } from '../../service/center.service';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  counties: string[] = ['TIMIS', 'CLUJ-NAPOCA', 'ARAD'];
  countyCitiesMap: { [county: string]: string[] } = {
    'TIMIS': ['TIMISOARA', 'City1B', 'City1C'],
    'CLUJ-NAPOCA': ['CLUJ', 'City2B', 'City2C'],
    'ARAD': ['ARAD', 'City3B', 'City3C'],
  };

  cities: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private centerService: CenterService,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      name: [''],
      county: [''],
      city: [{ value: '', disabled: true }],
      materials: [''],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.searchQuery = params.get('name') || '';
      this.searchForm.setValue({
        name: this.searchQuery,
        county: params.get('county') || '',
        city: params.get('city') || '',
        materials: params.get('materials') || '',
      });
      this.initializeSearch();
    });

    this.searchForm.get('county').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.searchForm.get('city').setValue('')), // Clear city on county change
        tap((county) => this.handleCountyChange(county)),
        filter(() => false) // Prevent reactive changes
      )
      .subscribe()

    this.searchForm.get('city').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => this.filterCities(value)),
        tap((cities) => (this.cities = cities)),
        filter(() => false) // Prevent reactive changes
      )
      .subscribe();

    this.searchCenters();

    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true))
      )
      .subscribe();

    this.searchForm.get('name').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(() =>
          this.centerService.searchCenters$(
            this.searchForm.get('name').value,
            this.searchForm.get('county').value,
            this.searchForm.get('city').value,
            this.searchForm.get('materials').value
          )
        ),
        catchError((error: string) => {
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        }),
        tap((response) => this.handleSearch(response))
      )
      .subscribe();

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((event) => event.key === 'Enter'),
        filter(() => this.searchForm.valid)
      )
      .subscribe(() => this.searchCenters());
  }


  private filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.searchForm.get('county').value;
    const citiesForCounty = this.getCitiesForCounty(selectedCounty);
    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  onSelectCounty(event: TypeaheadMatch): void {
    this.searchForm.get('city').setValue('');
    this.searchForm.get('city').enable();
  }

  onSelectCity(event: TypeaheadMatch): void {
  }

  private handleSearch(response: any): void {
    this.dataSubject.next(response);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        name: this.searchForm.get('name').value,
        county: this.searchForm.get('county').value,
        city: this.searchForm.get('city').value,
        materials: this.searchForm.get('materials').value,
      },
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
    const county = this.searchForm.get('county').value;
    const city = this.searchForm.get('city').value;
    const materials = this.searchForm.get('materials').value;

    this.isLoadingSubject.next(true);

    this.centerService
      .searchCenters$(name, county, city, materials, 0)
      .pipe(
        tap((response) => this.handleSearch(response)),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  private getCitiesForCounty(county: string): string[] {
    return this.countyCitiesMap[county] || [];
  }

  goToPage(pageNumber?: number): void {
    const name = this.searchForm.get('name').value;
    const county = this.searchForm.get('county').value;
    const city = this.searchForm.get('city').value;
    const materials = this.searchForm.get('materials').value;

    this.isLoadingSubject.next(true);

    this.centerService
      .searchCenters$(name, county, city, materials, pageNumber - 1)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
          this.currentPageSubject.next(pageNumber - 1);
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.searchForm.get('city');
    if (this.isValidCounty(county)) {
      cityControl.enable(); // Enable city when a valid county is selected
      this.cities = this.getCitiesForCounty(county);
    } else {
      cityControl.disable(); // Disable city when an invalid county is selected
      cityControl.setValue(''); // Clear city value if the county is invalid
    }
  }

  private isValidCounty(county: string): boolean {
    return this.counties.includes(county);
  }

  private isValidCity(city: string, selectedCounty: string): boolean {
    const citiesForCounty = this.getCitiesForCounty(selectedCounty);
    return citiesForCounty.includes(city);
  }

  searchCities = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.cities.filter((c) => this.isValidCity(c, this.searchForm.get('county').value))
      )
    );

  resetFilters(): void {
    this.searchForm.get('city').disable()

    this.isLoadingSubject.next(true)
    this.searchCenters();
    this.searchForm.reset()
    this.cities = [];


  }
}
