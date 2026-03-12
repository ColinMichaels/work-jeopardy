import {
  buildWindowTargetName,
  buildWindowUrl,
  getViewModeFromLocation,
} from '../src/lib/session-sync';

describe('session sync helpers', () => {
  it('builds a board URL that preserves unrelated params and shares the session', () => {
    const nextUrl = buildWindowUrl(
      'board',
      'session-abc',
      'http://localhost/game?foo=1&view=host&session=session-old',
    );
    const parsedUrl = new URL(nextUrl);

    expect(parsedUrl.searchParams.get('foo')).toBe('1');
    expect(parsedUrl.searchParams.get('view')).toBe('board');
    expect(parsedUrl.searchParams.get('session')).toBe('session-abc');
  });

  it('removes the view param for the single window URL', () => {
    const nextUrl = buildWindowUrl(
      'single',
      'session-xyz',
      'http://localhost/game?view=host&session=session-old',
    );
    const parsedUrl = new URL(nextUrl);

    expect(parsedUrl.searchParams.get('view')).toBeNull();
    expect(parsedUrl.searchParams.get('session')).toBe('session-xyz');
  });

  it('creates stable target names per view and session', () => {
    expect(buildWindowTargetName('host', 'session-123')).toBe('work-jeopardy:session-123:host');
  });

  it('reads the view mode from the current URL', () => {
    window.history.replaceState({}, '', '/?view=board');
    expect(getViewModeFromLocation()).toBe('board');

    window.history.replaceState({}, '', '/?view=host');
    expect(getViewModeFromLocation()).toBe('host');

    window.history.replaceState({}, '', '/');
    expect(getViewModeFromLocation()).toBe('single');
  });
});
