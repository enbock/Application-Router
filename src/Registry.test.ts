import ListenerAdapter from '@enbock/state-value-observer/ListenerAdapter';
import {IObserver, IOnChangeCallback} from '@enbock/state-value-observer/Observer';
import Registry from './Registry';
import {IPageData} from './Router';

describe(Registry, () => {
  let observer: IObserver<IPageData | null>, adapter: ListenerAdapter<IPageData | null>;

  beforeEach(() => {
    adapter = jest.genMockFromModule<ListenerAdapter<IPageData | null>>('@enbock/state-value-observer/ListenerAdapter');
    adapter.addListener = jest.fn();
    observer = {
      value: {
        name: 'hello',
        baseUrl: './hello/page.html',
        currentUrl: './hello/page.html'
      }
    };
  });

  it('Change url of page at register', () => {
    const page: IPageData = {
      name: 'page',
      baseUrl: './page/',
      currentUrl: './page/'
    };

    observer.value = {
      name: 'old',
      baseUrl: './this/is/old/',
      currentUrl: './this/is/old/'
    };

    const registry: Registry = new Registry(observer);
    registry.registerPage(page);

    expect(page.baseUrl).toBe('./page/');
    expect(page.currentUrl).toBe('../../../page/');
    expect(registry.getPages()).toEqual([page]);
  });

  it('Change url of page at register without current page', () => {
    const page: IPageData = {
      name: 'page',
      baseUrl: './page/',
      currentUrl: './page/'
    };

    observer.value = null;

    const registry: Registry = new Registry(observer);
    registry.registerPage(page);

    expect(page.baseUrl).toBe('./page/');
    expect(page.currentUrl).toBe('./page/');
    expect(registry.getPages()).toEqual([page]);
  });

  it('Ignores null page update', () => {
    const page: IPageData = {
      name: 'page',
      baseUrl: './page/',
      currentUrl: './page/'
    };
    observer.value = page;

    let callback: IOnChangeCallback<IPageData | null> = jest.fn();
    (adapter.addListener as jest.Mock)
      .mockImplementation((handler: IOnChangeCallback<IPageData | null>) => callback = handler);

    const registry: Registry = new Registry(observer);
    registry.attachAdapter(adapter);
    registry.registerPage(page);
    page.currentUrl = 'no Changes';

    callback(null);

    expect(page.currentUrl).toBe('no Changes');
  });

  it('Update pages', () => {
    let callback: IOnChangeCallback<IPageData | null> = jest.fn();
    const listenerSpy: jest.Mock = adapter.addListener as jest.Mock;
    listenerSpy.mockImplementation((handler: IOnChangeCallback<IPageData | null>) => callback = handler);

    const page: IPageData = {
      name: 'page',
      baseUrl: './page/',
      currentUrl: './page/'
    };
    const newPage: IPageData = {
      name: 'newPage',
      baseUrl: './new/page.html',
      currentUrl: './new/page.html'
    };

    const oldPage: { currentUrl: string; baseUrl: string; name: string } = {
      name: 'old',
      baseUrl: './this/is/old/',
      currentUrl: './this/is/old/'
    };
    observer.value = oldPage;

    const registry: Registry = new Registry(observer);
    registry.attachAdapter(adapter);
    registry.registerPage(oldPage);
    registry.registerPage(page);
    registry.registerPage(newPage);

    expect(page.currentUrl).toBe('../../../page/');
    expect(newPage.currentUrl).toBe('../../../new/page.html');

    callback(newPage);
    expect(page.currentUrl).toBe('../page/');
    expect(newPage.currentUrl).toBe('./page.html');

    callback(page);
    expect(page.currentUrl).toBe('./');
    expect(newPage.baseUrl).toBe('./new/page.html');
    expect(newPage.currentUrl).toBe('../new/page.html');

  });
});
