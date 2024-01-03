import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'rewardPoints'
})
export class RewardPointsPipe implements PipeTransform {
  transform(amount: number, rewardPointsPerUnit: number, unitRatio: number): number {
    const rawResult = amount * rewardPointsPerUnit * unitRatio;
    return Math.ceil(rawResult);
  }
}
