import {TypeaheadMatch} from 'ngx-bootstrap/typeahead';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
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
import {LocationService} from "../../service/location.service";
import {Sort} from "@angular/material/sort";

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

  isFiltersCollapsed = true;

  toggleFilters() {
    this.isFiltersCollapsed = !this.isFiltersCollapsed;
  }

  availableMaterials: string[] = ['PAPER', 'GLASS', 'PLASTIC', 'ALUMINUM', 'METALS', 'E-WASTE'];

  selectedMaterials: string[] = []

  sortedColumn: string;

  counties: string[] = this.locationService.getAllCounties();

  cities: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private centerService: CenterService,
    private formBuilder: FormBuilder,
    private locationService: LocationService
  ) {
    this.searchForm = this.formBuilder.group({
      name: [''],
      county: [''],
      city: [{ value: '', disabled: true }],
      materials: [''],
      sortBy: ['createdAt'],
      sortOrder: ['asc'],
    });

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.searchQuery = params.get('name') || '';
      this.searchForm.setValue({
        name: this.searchQuery,
        county: params.get('county') || '',
        city: params.get('city') || '',
        materials: params.get('materials') || '',
        sortBy: params.get('sortBy') || 'createdAt',
        sortOrder: params.get('sortOrder') || 'asc',
      });
      this.initializeSearch();
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
        sortBy: params.get('sortBy') || 'createdAt',
        sortOrder: params.get('sortOrder') || 'asc',
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

    this.searchForm.get('materials').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((material) => this.onSelectMaterials(material)),
        filter(() => false) // Prevent reactive changes
      )

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
            this.searchForm.get('materials').value,
            this.searchForm.get('sortBy').value,
            this.searchForm.get('sortOrder').value
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
        tap(() => this.searchCenters()), // Trigger search when the sorting changes
        filter(() => false) // Prevent reactive changes
      )
      .subscribe();

    this.searchForm.get('sortOrder').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(() => this.searchCenters()), // Trigger search when the sorting changes
        filter(() => false) // Prevent reactive changes
      )
      .subscribe();

    console.log(this.availableMaterials)

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((event) => event.key === 'Enter'),
        filter(() => this.searchForm.valid)
      )
      .subscribe(() => this.searchCenters());

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
    const materials = this.selectedMaterials.join(',');
    const page = this.currentPageSubject.value;

    const sortBy = this.searchForm.get('sortBy').value;
    const sortOrder = this.searchForm.get('sortOrder').value;

    this.isLoadingSubject.next(true);

    this.centerService
      .searchCenters$(name, county, city, materials, sortBy, sortOrder, page)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
          this.updateUrlParameters();
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  private getCitiesForCounty(county: string): string[] {
    return this.locationService.getCitiesForCounty(county);
  }

  goToPage(pageNumber?: number): void {
    const name = this.searchForm.get('name').value;
    const county = this.searchForm.get('county').value;
    const city = this.searchForm.get('city').value;
    const materials = this.selectedMaterials.join(",");
    const sortBy  = this.searchForm.get('sortBy').value;
    const sortOrder  = this.searchForm.get('sortOrder').value;
    console.log(materials)

    this.isLoadingSubject.next(true);

    this.centerService
      .searchCenters$(name, county, city, materials, sortBy, sortOrder, pageNumber - 1)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
          this.updateUrlParameters();
          this.currentPageSubject.next(pageNumber - 1);
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.searchForm.get('city');
    if (this.locationService.isValidCounty(county)) {
      cityControl.enable();
      this.locationService.getCitiesForCounty(county);
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }

  resetFilters(): void {
    this.searchForm.get('city').disable()

    this.isLoadingSubject.next(true)
    this.searchCenters();
    this.searchForm.reset()
    this.cities = [];
    this.selectedMaterials = [];

  }

  onSelectMaterials(event: TypeaheadMatch): void {
    const selectedMaterial = event.item;

    // Check if the material is not already in the list
    if (!this.selectedMaterials.includes(selectedMaterial)) {
      this.selectedMaterials.push(selectedMaterial);
      this.updateSearch(); // Update search when a new material is added
    }
  }

  onRemoveMaterial(material: string): void {
    this.selectedMaterials = this.selectedMaterials.filter((m) => m !== material);
    this.updateSearch(); // Update search when a material is removed
  }

  private updateSearch(): void {
    this.isLoadingSubject.next(true);
    this.searchCenters();
  }

  redirectNewCenter() {
    this.router.navigate(["/centers/new"])
  }

  private filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.searchForm.get('county').value;
    const citiesForCounty = this.getCitiesForCounty(selectedCounty);

    // Return all cities when the filter value is empty
    if (!filterValue) {
      return of(citiesForCounty);
    }

    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  sort(event: Sort): void {
    const currentSortBy = this.searchForm.get('sortBy').value;
    const currentSortOrder = this.searchForm.get('sortOrder').value;

    // Toggle the sorting order when the same column is clicked
    const newSortOrder = currentSortBy === event.active ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

    this.searchForm.get('sortBy').setValue(event.active, { emitEvent: false });
    this.searchForm.get('sortOrder').setValue(newSortOrder, { emitEvent: false });

    // Trigger the search with updated sorting parameters
    this.searchCenters();
  }

  isSorted(column: string, order: string): boolean {
    // return this.searchForm.get('sortBy').value === column && this.searchForm.get('sortOrder').value === order;

    const sortBy = this.searchForm.get('sortBy').value;
    const sortOrder = this.searchForm.get('sortOrder').value;

    // Check if the column is sorted
    if (sortBy === column && sortOrder === order) {
      return true;
    }

    // Check if the column is filtered
    return this.isFiltered(column) && sortOrder === order;
  }

  isFiltered(column: string): boolean {
    return this.searchForm.get(column).value !== '';
  }


  private updateUrlParameters(): void {
    const name = this.searchForm.get('name').value;
    const county = this.searchForm.get('county').value;
    const city = this.searchForm.get('city').value;
    const materials = this.selectedMaterials.join(",");
    const sortBy = this.searchForm.get('sortBy').value;
    const sortOrder = this.searchForm.get('sortOrder').value;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        name,
        county,
        city,
        materials,
        sortBy,
        sortOrder,
      },
      queryParamsHandling: 'merge',
    });
  }

}
