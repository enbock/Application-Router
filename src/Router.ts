import {Observer} from '@enbock/state-value-observer/ValueObserver';

export interface PageData {
  name: string,
  baseUrl: string
  currentUrl: string
}

export default class Router {
  currentPage: Observer<PageData | null>;
  history: History;

  constructor(pageObserver: Observer<PageData | null>, history: History) {
    this.currentPage = pageObserver;
    this.history = history;
  }

  attachTo(window: Window) {
    window.addEventListener('popstate', this.onHistoryChange.bind(this));
  }

  initialize(): void {
    if (this.currentPage.value == null) return;
    const firstPage: PageData = this.currentPage.value;
    this.history.replaceState(firstPage, firstPage.name, firstPage.baseUrl);
    this.updatePage(firstPage);
  }

  changePage(newPage: PageData): void {
    const currentPage: PageData | null = this.currentPage.value;
    if (currentPage != null && currentPage.name == newPage.name) {
      return;
    }

    this.history.replaceState(newPage, newPage.name, newPage.currentUrl);
    this.updatePage(newPage);
  }

  protected updatePage(page: PageData): void {
    this.currentPage.value = page;
  }

  protected onHistoryChange(event: PopStateEvent): void {
    const newPage: PageData = event.state as PageData;
    this.updatePage(newPage);
  }
}
