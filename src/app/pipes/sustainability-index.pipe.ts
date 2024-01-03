import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sustainabilityIndex',
  pure: false,
  standalone: true
})
export class SustainabilityIndexPipe implements PipeTransform {
  transform(rewardPoints: number): number {
    const sustainabilityIndex = (3 / 100) * rewardPoints;
    return parseFloat(sustainabilityIndex.toFixed(3));
  }
}
