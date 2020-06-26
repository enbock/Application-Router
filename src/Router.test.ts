import {IObserver} from '@enbock/state-value-observer/Observer';
import Router, {IPageData} from './Router';

describe(Router, () => {
  let window: Window, history: History, pageObserver: IObserver<IPageData | null>;

  beforeEach(() => {
    // @ts-ignore
    window = {addEventListener: jest.fn()};
    // @ts-ignore
    history =
      {
        pushState: jest.fn(),
        replaceState: jest.fn()
      };
    pageObserver = {
      value: {
        name: 'hello',
        baseUrl: './hello/page.html',
        currentUrl: './hello/page.html'
      }
    };
  });

  it('Attach to window event', (done) => {
    const listenerSpy: jest.Mock = window.addEventListener as jest.Mock;

    listenerSpy.mockImplementation((type: string, callback: Function) => {
      expect(type).toBe('popstate');
      expect(callback).toBeInstanceOf(Function);

      done();
    });

    const router: Router = new Router(pageObserver, history);
    router.attachTo(window);
  });

  it('Change current page on history update', () => {
    const listenerSpy: jest.Mock = window.addEventListener as jest.Mock;
    let eventHandler: Function = jest.fn();
    listenerSpy.mockImplementation((type: string, callback: Function) => eventHandler = callback);

    const router: Router = new Router(pageObserver, history);
    router.attachTo(window);
    const oldPage: IPageData = {
      name: 'before',
      baseUrl: './before/page.html',
      currentUrl: './before/page.html'
    };
    const event: PopStateEvent = new PopStateEvent('popstate', {state: oldPage});
    eventHandler(event);
    expect(pageObserver.value).toBe(oldPage);
  });

  it('Initialize first page', () => {
    const router: Router = new Router(pageObserver, history);
    const firstPage: IPageData = {
      name: 'first',
      baseUrl: './new/page.html',
      currentUrl: '../new/page.html'
    };
    pageObserver.value = firstPage;

    router.initialize();
    expect(history.replaceState).toBeCalledWith(firstPage, 'first', './new/page.html');
  });

  it('Initialize without pages', () => {
    const router: Router = new Router(pageObserver, history);
    const firstPage: IPageData = {
      name: 'first',
      baseUrl: './new/page.html',
      currentUrl: '../new/page.html'
    };
    pageObserver.value = null;

    router.initialize();
    expect(history.replaceState).not.toBeCalled();
  });

  it('Change to a new page', () => {
    const router: Router = new Router(pageObserver, history);
    const newPage: IPageData = {
      name: 'new',
      baseUrl: './new/page.html',
      currentUrl: './new/page.html'
    };

    router.changePage(newPage);
    expect(pageObserver.value).toBe(newPage);
    expect(history.replaceState).toBeCalledWith(newPage, 'new', './new/page.html');
    expect(history.replaceState).toBeCalledTimes(1);

    router.changePage(newPage);
    expect(history.replaceState).toBeCalledTimes(1);
  });

});
