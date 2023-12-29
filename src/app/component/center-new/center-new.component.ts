
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
import {NgbTimeStruct} from "@ng-bootstrap/ng-bootstrap";

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

  counties: string[] = this.locationService.getAllCounties();
  cities: string[] = [];

  newCenterForm: FormGroup;

  availableMaterials: string[] = ['GLASS', 'PLASTIC', 'PAPER', 'ALUMINIUM', 'METALS'];
  selectedMaterials: string[] = []
  openingTime: NgbTimeStruct;
  closingTime: NgbTimeStruct;

  constructor(
    private router: Router,
    private centerService: CenterService,
    private locationService: LocationService,
    private formBuilder: FormBuilder
  ) {
    this.openingTime = { hour: 8, minute: 0, second: 0 };
    this.closingTime = { hour: 20, minute: 0, second: 0 };

    this.newCenterForm = this.formBuilder.group({
      name: ['', Validators.required],
      county: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      materials: [''],
      openingTime: [''],
      closingTime: [''],
      alwaysOpen: [false],
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

    this.newCenterForm
      .get('county')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      tap(() => this.newCenterForm.get('city').setValue('')),
      tap((county) => this.handleCountyChange(county)),
      switchMap((value) => this.filterCounties(value)),
      tap((counties) => (this.counties = counties))
    )
      .subscribe();

    this.newCenterForm
      .get('city')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      switchMap((value) => this.filterCities(value)),
      tap((cities) => (this.cities = cities)),
      filter(() => false)
    )
      .subscribe();

    this.newCenterForm
      .get('materials').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap((material) => this.onSelectMaterials(material)),
        filter(() => false)
      )
  }



  createCenter(): void {
    this.isLoadingSubject.next(true);

    if (this.newCenterForm.get('alwaysOpen').value) {
      this.newCenterForm.get('openingTime').setValue(null);
      this.newCenterForm.get('closingTime').setValue(null);
    } else {
      const openingTime = this.formatTime(this.newCenterForm.get('openingTime').value);
      const closingTime = this.formatTime(this.newCenterForm.get('closingTime').value);

      this.newCenterForm.get('openingTime').setValue(openingTime);
      this.newCenterForm.get('closingTime').setValue(closingTime);
    }

    const formData = { ...this.newCenterForm.value, materials: this.selectedMaterials };

    console.log(formData)

    this.centerService.create$(formData).pipe(
      map((response) => {
        console.log(response);
        this.newCenterForm.reset({ county: '', city: '' });
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
    this.newCenterForm.get('city').enable();
  }

  filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.newCenterForm.get('county').value;
    const citiesForCounty = this.locationService.getCitiesForCounty(selectedCounty);

    if (!filterValue) {
      return of(citiesForCounty);
    }

    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.newCenterForm.get('city');

    if (this.locationService.isValidCounty(county)) {
      cityControl.enable();
      this.loadCitiesForCounty(county);
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }

  onSelectCity(event: TypeaheadMatch): void {
  }

  onSelectMaterials(event: TypeaheadMatch): void {
    const selectedMaterial = event.item;

    if (!this.selectedMaterials.includes(selectedMaterial)) {
      this.selectedMaterials.push(selectedMaterial);
    }

    this.newCenterForm.get("materials").reset()

    console.log(this.selectedMaterials.length);
  }

  onRemoveMaterial(material: string): void {
    this.selectedMaterials = this.selectedMaterials.filter((m) => m !== material);
  }

  private formatTime(time: NgbTimeStruct): string {
    return `${time.hour}:${time.minute}`;
  }
}

