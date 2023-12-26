import { Pipe, PipeTransform } from '@angular/core';
import {RecyclingCenter} from "../interface/recycling-center";
import {RecyclableMaterial} from "../interface/recyclable-material";

@Pipe({
  name: 'acceptedMaterials',
  standalone: true
})
export class AcceptedMaterialsPipe implements PipeTransform {
  transform(center: RecyclingCenter): { name: string; badgeClass: string }[] {
    if (center && center.acceptedMaterials && center.acceptedMaterials.length > 0) {
      return center.acceptedMaterials.map((material: RecyclableMaterial)  => {
        return {
          name: material.name,
          badgeClass: this.getBadgeClass(material.name),
        };
      });
    } else {
      return [];
    }
  }

  private getBadgeClass(materialName: string): string {
    switch (materialName.toUpperCase()) {
      case 'PAPER':
        return 'badge-soft-paper';
      case 'PLASTIC':
        return 'badge-soft-plastic';
      case 'GLASS':
        return 'badge-soft-glass';
      case 'METALS':
        return 'badge-soft-metals';
      case 'ALUMINIUM':
        return 'badge-soft-aluminum';
      case 'E-WASTE':
        return 'badge-soft-ewaste';
      default:
        return 'badge-soft-default';
    }
  }
}
