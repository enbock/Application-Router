import ListenerAdapter from '@enbock/state-value-observer/ListenerAdapter';
import {IObserver} from '@enbock/state-value-observer/Observer';
import {IPageData} from './Router';

export interface IPageDictionary<T> {
  [index: string]: T
}

export default class Registry {
  dictionary: IPageDictionary<IPageData>;
  observer: IObserver<IPageData | null>;

  constructor(observer: IObserver<IPageData | null>) {
    this.observer = observer;
    this.dictionary = {};
  }

  attachAdapter(adapter: ListenerAdapter<IPageData | null>): void {
    adapter.addListener(this.updatePageData.bind(this));
  }

  getPages(): IPageData[] {
    const pages: IPageData[] = [];

    Object.keys(this.dictionary).forEach((pageName: string) => {
      const page: IPageData = this.dictionary[pageName];
      pages.push(page);
    });

    return pages;
  }

  registerPage(page: IPageData) {
    if (this.observer.value != null) {
      this.updatePageUrlByDepth(this.observer.value, page);
    }
    this.dictionary[page.name] = page;
  }

  protected updatePageData(newValue: IPageData | null): void {
    if (newValue == null) return;
    Object.keys(this.dictionary).forEach(
      (pageName: string) => {
        this.updatePageUrlByDepth(newValue, this.dictionary[pageName]);
      }
    );
  }

  protected updatePageUrlByDepth(currentPage:IPageData, registeredPage: IPageData): void {
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
