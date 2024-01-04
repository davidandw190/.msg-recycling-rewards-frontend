import {Component, Input, OnInit} from '@angular/core';
import {SustainabilityIndexPipe} from "../../pipes/sustainability-index.pipe";

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  @Input() userRewardPoints: number;
  @Input() activeRecyclers: number;
  @Input() recyclersRewardPoints: number;

  currentMonth: Date = new Date();

  userSustainabilityIndex: number = 0;
  recyclersSustainabilityIndex: number = 0;

  constructor(
    private sustainabilityIndexPipe: SustainabilityIndexPipe
  ) {

  }

  ngOnInit(): void {
    this.userSustainabilityIndex = this.sustainabilityIndexPipe.transform(this.userRewardPoints);
    this.recyclersSustainabilityIndex = this.sustainabilityIndexPipe.transform(this.recyclersRewardPoints);
  }


}
