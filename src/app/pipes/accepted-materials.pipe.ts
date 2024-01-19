import { Pipe, PipeTransform } from '@angular/core';
import {RecyclingCenter} from "../interface/recycling-center";
import {RecyclableMaterial} from "../interface/recyclable-material";

@Pipe({
  name: 'acceptedMaterials',
  standalone: true,
  pure: false
})
export class AcceptedMaterialsPipe implements PipeTransform {
  transform(input: RecyclingCenter | RecyclableMaterial[]): { name: string; badgeClass: string }[] {
    if (Array.isArray(input) && input.length > 0) {
      // CASE: Array of RecyclableMaterial
      return input.map((material: RecyclableMaterial)  => {
        return {
          name: material.name,
          badgeClass: this.getBadgeClass(material.name),
        };
      });
    } else if (!Array.isArray(input) && input && input.acceptedMaterials && input.acceptedMaterials.length > 0) {
      // CASE: RecyclingCenter
      return input.acceptedMaterials.map((material: RecyclableMaterial)  => {
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
        return 'badge-soft-aluminium';
      case 'ELECTRONICS':
        return 'badge-soft-ewaste';
      default:
        return 'badge-soft-default';
    }
  }
}
