import ListenerAdapter from '@enbock/state-value-observer/ListenerAdapter';
import {Observer} from '@enbock/state-value-observer/ValueObserver';
import {PageData} from './Router';

export interface PageDictionary<Type> {
  [index: string]: Type
}

export default class Registry {
  dictionary: PageDictionary<PageData>;
  observer: Observer<PageData | null>;

  constructor(observer: Observer<PageData | null>) {
    this.observer = observer;
    this.dictionary = {};
  }

  attachAdapter(adapter: ListenerAdapter<PageData | null>): void {
    adapter.addListener(this.updatePageData.bind(this));
  }

  getPages(): PageData[] {
    const pages: PageData[] = [];

    Object.keys(this.dictionary).forEach((pageName: string) => {
      const page: PageData = this.dictionary[pageName];
      pages.push(page);
    });

    return pages;
  }

  registerPage(page: PageData) {
    if (this.observer.value != null) {
      this.updatePageUrlByDepth(this.observer.value, page);
    }
    this.dictionary[page.name] = page;
  }

  protected updatePageData(newValue: PageData | null): void {
    if (newValue == null) return;
    Object.keys(this.dictionary).forEach(
      (pageName: string) => {
        this.updatePageUrlByDepth(newValue, this.dictionary[pageName]);
      }
    );
  }

  protected updatePageUrlByDepth(currentPage:PageData, registeredPage: PageData): void {
    let relativeBack: string = '', index: number = 0, newUrl: string;

    if (registeredPage == currentPage) {
      newUrl = registeredPage.baseUrl.replace(/.*\//, './');
    } else {
      const depth: number = currentPage.baseUrl.replace(/[^\/]*/g, '').length - 1;
      for (index = 0; index < depth; index++) {
        relativeBack += '../';
      }
      newUrl = (relativeBack + registeredPage.baseUrl).replace('.././', '../');
    }

    registeredPage.currentUrl = newUrl;
  }
}
