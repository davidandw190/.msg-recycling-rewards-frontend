import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AppState } from '../../interface/app-state';
import { CustomHttpResponse } from '../../interface/custom-http-response';
import { DataState } from '../../enum/data-state.enum';
import { CenterDetailsResponse } from '../../interface/center-details-response';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CenterService } from '../../service/center.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecyclableMaterial } from '../../interface/recyclable-material';
import { UnitMeasure } from '../../interface/unit-measure';

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css'],
})
export class CenterDetailsComponent implements OnInit {
  centerDetailsState$: Observable<AppState<CustomHttpResponse<CenterDetailsResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CenterDetailsResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  private readonly CENTER_ID: string = 'id';

  recyclingForm: FormGroup;
  addedValue: number | null = null;

  acceptedMaterials: RecyclableMaterial[] = [];

  unitMeasuresMap: Map<string, UnitMeasure> = new Map([
    ['G', { label: 'Gram (g)', value: 'g', ratio: 0.5 }],
    ['KG', { label: 'Kilogram (kg)', value: 'kg', ratio: 5 }],
    ['BOTTLE_0.5L', { label: 'Bottle (0.5L)', value: '0.5L', ratio: 2.5 }],
    ['BOTTLE_1L', { label: 'Bottle (1L)', value: '1L', ratio: 5 }],
    ['BOTTLE_1.5L', { label: 'Bottle (1.5L)', value: '1.5L', ratio: 7.5 }],
    ['BOTTLE_2L', { label: 'Bottle (2L)', value: '2L', ratio: 10 }],
    ['CAN', { label: 'Can', value: 'can/(s)', ratio: 2.5 }],
    ['PIECE', { label: 'Piece', value: 'piece/(s)', ratio: 2.5 }],
  ]);

  materialUnitMeasures: Map<string, UnitMeasure[]> = new Map([
    ['PAPER', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('PIECE'),
    ]],

    ['PLASTIC', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('PIECE'),
      this.unitMeasuresMap.get('BOTTLE_0.5L'),
      this.unitMeasuresMap.get('BOTTLE_1L'),
      this.unitMeasuresMap.get('BOTTLE_1.5L'),
      this.unitMeasuresMap.get('BOTTLE_2.0L'),
    ]],

    ['METALS', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('CAN'),
    ]],

    ['GLASS', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('BOTTLE_0.5L'),
      this.unitMeasuresMap.get('BOTTLE_1L'),
    ]],

    ['ALUMINUM', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('BOTTLE_0.5L'),
      this.unitMeasuresMap.get('BOTTLE_1L'),
      this.unitMeasuresMap.get('CAN'),
    ]],

    ['ELECTRONICS', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
    ]],
  ]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private centerService: CenterService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.centerDetailsState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.centerService.centerDetails$(+params.get(this.CENTER_ID)).pipe(
          map((response) => {
            console.log(response);
            this.dataSubject.next(response);
            this.acceptedMaterials = response.data.center.acceptedMaterials || [];
            return { dataState: DataState.LOADED, appData: response };
          }),

          startWith({ dataState: DataState.LOADING }),

          catchError((error: string) => {
            return of({ dataState: DataState.ERROR, error });
          })
        );
      })
    );

    this.centerDetailsState$.subscribe(() => {
      this.initializeForm();
    });
  }

  initializeForm() {
    this.recyclingForm = this.formBuilder.group({
      recycledMaterialType: ['', Validators.required],
      unitMeasure: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
    });

    this.recyclingForm.get('recycledMaterialType').valueChanges.subscribe((materialType) => {
      const unitMeasures = this.materialUnitMeasures.get(materialType) || [];
      this.recyclingForm.get('unitMeasure').setValue('');
      this.unitMeasuresMap[materialType] = unitMeasures;
    });

    this.recyclingForm.valueChanges.subscribe(() => {
      this.calculateAddedValue();
    });
  }

  calculateAddedValue() {
    const materialType = this.recyclingForm.value.recycledMaterialType;
    const unitMeasure = this.recyclingForm.value.unitMeasure;
    const amount = this.recyclingForm.value.amount;

    if (materialType && unitMeasure && amount !== null) {
      const selectedMaterial = this.acceptedMaterials.find((m) => m.name === materialType);

      if (selectedMaterial) {
        const rewardPointsPerUnit = selectedMaterial.reward_points || 1;
        const unitRatio = this.materialUnitMeasures.get(materialType)?.find(unit => unit.value === unitMeasure)?.ratio || 1;
        this.addedValue = amount * rewardPointsPerUnit * unitRatio;
      } else {
        console.error('Selected material not found in acceptedMaterials array');
        this.addedValue = null;
      }
    } else {
      this.addedValue = null;
    }
  }

  getMaterialName(materialType: number): string {
    const material = this.acceptedMaterials.find((m) => m.materialId === materialType);
    return material ? material.name : '';
  }

  onSubmit() {
    // Handle form submission logic here
    // This is where you can send the form data to your server or perform other actions.
  }

  get recycledMaterialTypeValue(): string {
    return this.recyclingForm.get('recycledMaterialType').value;
  }
}
