import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightSearch'
})
export class HighlightSearchPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, searchTerm: string): string {
    if (!searchTerm) {
      return value;
    }

    const regex = new RegExp(searchTerm, 'gi');
    return value.replace(regex, match => `<span class="highlight">${match}</span>`);
  }
}
