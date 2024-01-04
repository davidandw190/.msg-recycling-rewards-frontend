import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'unitConversion',
  standalone: true
})
export class UnitConversionPipe implements PipeTransform {
  transform(value: number, targetUnit: string): number {
    if (!isNaN(value)) {
      return Math.floor(value / this.getUnitRatio(targetUnit.toUpperCase()));
    }
    return 0;
  }

  private getUnitRatio(unit: string): number {
    const unitRatios: { [key: string]: number } = {
      'KG': 6,
      '0.5L': 3,
      '1L': 6,
      '1.5L': 8,
      '2L': 10,
      'CAN': 3,
      'PIECE': 3,
    };

    return unitRatios[unit] || 1;
  }
}
