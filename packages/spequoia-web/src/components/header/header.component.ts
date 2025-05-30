import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  signal,
} from '@angular/core';
import { ProcessedDocument } from '../../models/processed-document.model';
import { Router, RouterLink } from '@angular/router';
import { TagComponent } from '../tag/tag.component';
import { DocumentService } from '../../services/document.service';
import { TagDropdownComponent } from '../tag-dropdown/tag-dropdown.component';
import { SearchService } from '../../services/search.service';
import { MatchInfo, SearchResult } from 'minisearch';

@Component({
  selector: 'header',
  imports: [RouterLink, TagComponent, TagDropdownComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input()
  document!: ProcessedDocument;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly searchResults = signal<HighlightedSearchResult[]>([]);

  constructor(
    readonly documentService: DocumentService,
    readonly searchService: SearchService,
    readonly router: Router,
    private elementRef: ElementRef,
  ) {}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement
      .querySelector('.search-container')
      ?.contains(event.target as Node);
    if (!clickedInside) {
      this.searchResults.set([]);
    }
  }

  toggleTag(tagName: string) {
    this.documentService.toggleTagFilter(tagName);
  }

  public removeTagFilter(tagName: string): void {
    this.documentService.removeTagFilter(tagName);
  }

  public handleInput($event: Event): void {
    const input = $event.target as HTMLInputElement;
    this.performSearch(input.value);
  }

  public handleInputClick($event: Event): void {
    const input = $event.target as HTMLInputElement;
    if (input.value.trim()) {
      this.performSearch(input.value);
    }
  }

  private performSearch(query: string): void {
    const results = this.searchService.search(query);
    this.searchResults.set(
      results
        .map((result) => {
          const match = result.match;
          return this.highlightSearchResults(match, result);
        })
        .flat(),
    );
  }

  private highlightSearchResults(
    match: MatchInfo,
    result: SearchResult,
  ): HighlightedSearchResult[] {
    return Object.entries(match)
      .slice(0, 1)
      .map((entry) => {
        const [matchedTerm, locations] = entry;

        return locations
          .map((location) => {
            const name = result['name'];
            const description = result['description'];
            const highlightedName =
              location === 'name'
                ? this.getMatchingSnippet(name, matchedTerm)
                : name;
            const highlightedDescription =
              location === 'description'
                ? this.getMatchingSnippet(description, matchedTerm)
                : description.slice(0, 100);
            return {
              id: result['id'],
              anchorId: result['anchorId'],
              name: highlightedName,
              description: highlightedDescription,
            } satisfies HighlightedSearchResult;
          })
          .flat();
      })
      .flat();
  }

  public onResultClick(result: HighlightedSearchResult): void {
    this.searchResults.set([]);
    this.documentService.clearTagFilters();

    setTimeout(() => {
      this.router.navigate(['/'], { fragment: result.anchorId }).then(() => {
        this.documentService.requestExternalScroll();
      });
    });
  }

  private getMatchingSnippet(description: string, query: string): string {
    if (!description) return '';
    if (!query) return description.slice(0, 100) + '...';

    const index = description.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return description.slice(0, 100) + '...';

    const start = Math.max(0, index - 50);
    const end = Math.min(description.length, index + query.length + 50);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < description.length ? '...' : '';
    const beforeMatch = description.slice(start, index);
    const match = description.slice(index, index + query.length);
    const afterMatch = description.slice(index + query.length, end);

    return (
      prefix +
      beforeMatch +
      `<span class="highlight">${match}</span>` +
      afterMatch +
      suffix
    );
  }
}

interface HighlightedSearchResult {
  id: string;
  anchorId: string;
  name: string;
  description?: string;
}
