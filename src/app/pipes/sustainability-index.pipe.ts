import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'sustainabilityIndex'
})
export class SustainabilityIndexPipe implements PipeTransform {
  transform(rewardPoints: number): number {
    const sustainabilityIndex = (5 / 100) * rewardPoints;
    return parseFloat(sustainabilityIndex.toFixed(3));
  }
}
