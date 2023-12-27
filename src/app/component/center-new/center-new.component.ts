import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { CustomHttpResponse } from '../../interface/custom-http-response';
import { AppState } from '../../interface/app-state';
import { CentersPageResponse } from '../../interface/centers-page-response';
import { DataState } from '../../enum/data-state.enum';
import { CenterService } from '../../service/center.service';
import { LocationService } from '../../service/location.service';

@Component({
  selector: 'app-center-new',
  templateUrl: './center-new.component.html',
  styleUrls: ['./center-new.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CenterNewComponent implements OnInit {
  newCenterState$: Observable<AppState<CustomHttpResponse<CentersPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CentersPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  countySelectForm: FormGroup;
  citySelectForm: FormGroup;

  counties: string[] = this.locationService.getAllCounties();
  cities: string[] = [];

  constructor(
    private router: Router,
    private centerService: CenterService,
    private locationService: LocationService,
    private formBuilder: FormBuilder
  ) {
    this.countySelectForm = this.formBuilder.group({
      county: ['', Validators.required], // Add Validators.required
    });

    this.citySelectForm = this.formBuilder.group({
      city: { value: '', disabled: true },
    });

  }

  ngOnInit(): void {
    this.newCenterState$ = this.centerService.centers$().pipe(
      map((response) => {
        console.log(response);
        this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response };
      }),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );

    this.countySelectForm
      .get('county')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      tap(() => this.citySelectForm.get('city').setValue('')),
      tap((county) => this.handleCountyChange(county)),
      switchMap((value) => this.filterCounties(value)),
      tap((counties) => (this.counties = counties))
    )
      .subscribe();

    this.citySelectForm
      .get('city')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      switchMap((value) => this.filterCities(value)),
      tap((cities) => (this.cities = cities)),
      filter(() => false)
    )
      .subscribe();
  }

  createCenter(): void {
    this.isLoadingSubject.next(true);
    this.centerService.create$(this.countySelectForm.value).pipe(
      map((response) => {
        console.log(response);
        this.countySelectForm.reset({ county: '', city: '' });
        this.isLoadingSubject.next(false);
        return { dataState: DataState.LOADED, appData: this.dataSubject.value };
      }),
      startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        return of({ dataState: DataState.LOADED, error });
      })
    ).subscribe((result) => {
      this.newCenterState$ = of(result);
    });
  }

  onSelectCounty(event: TypeaheadMatch): void {
    const selectedCounty = event.item;
    this.loadCitiesForCounty(selectedCounty);
  }

  filterCounties(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return of(this.counties.filter((county) => county.toLowerCase().includes(filterValue)));
  }

  private loadCitiesForCounty(county: string): void {
    this.cities = this.locationService.getCitiesForCounty(county);
    this.citySelectForm.get('city').enable();
  }

  filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.countySelectForm.get('county').value;
    const citiesForCounty = this.locationService.getCitiesForCounty(selectedCounty);

    if (!filterValue) {
      return of(citiesForCounty);
    }

    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.citySelectForm.get('city');

    if (this.locationService.isValidCounty(county)) {
      cityControl.enable();
      this.loadCitiesForCounty(county);
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }

  onSelectCity(event: TypeaheadMatch): void {
    // Handle city selection if needed
  }
}
