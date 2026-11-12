"""Run with Python + Playwright and installed Chrome: python test-link-navigation.py."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        channel='chrome', headless=True,
        ignore_default_args=['--disable-popup-blocking'],
    )
    context = browser.new_context()
    source_url = 'https://json-tool.test/'
    target_url = 'https://target.example/path?x=1&y=2'
    source = Path(__file__).with_name('index.html').read_text(encoding='utf-8')

    def route_request(route):
        if route.request.url == source_url:
            route.fulfill(status=200, content_type='text/html', body=source)
        elif route.request.url == target_url:
            route.fulfill(status=200, content_type='text/html', body='<title>Destination</title>')
        else:
            route.abort()

    context.route('**/*', route_request)
    inspector = context.new_page()
    inspector.goto('chrome://tab-search.top-chrome/')
    inspector.wait_for_function("document.querySelector('tab-search-app')?.apiProxy_")
    page = context.new_page()
    page.goto(source_url)
    page.locator('#input').fill(json.dumps({'url': target_url}))
    page.locator('#format').click()
    page.locator('.json-link').click()
    assert len(context.pages) == 2, 'Plain click must not navigate'
    assert page.locator('#path-track').inner_text() == '$.url'

    for view, action in [('format', 'Control'), ('compact', 'Control'), ('format', 'Meta'), ('format', 'Enter')]:
        page.locator('#' + view).click()
        link = page.locator('.json-link')
        with context.expect_page() as opened:
            if action == 'Enter':
                link.focus()
                page.keyboard.press('Enter')
            else:
                link.click(modifiers=[action])
        target = opened.value
        target.wait_for_load_state()
        assert target.url == target_url
        assert target.evaluate('opener === null && document.referrer === ""')
        # Headless document.hasFocus() is misleading; inspect Chrome's actual active tab.
        tabs = inspector.evaluate("""async () => {
            const {profileData} = await document.querySelector('tab-search-app').apiProxy_.getProfileData();
            return profileData.windows.flatMap(window => window.tabs).map(({url, active}) => ({url, active}));
        }""")
        assert next(tab for tab in tabs if tab['url'] == target_url)['active'], (view, action, tabs)
        assert not next(tab for tab in tabs if tab['url'] == source_url)['active']
        assert len(context.pages) == 3, 'Exactly one destination tab should open'
        target.close()
    print('Chrome', browser.version, ': real modifier clicks activate the destination; plain click, keyboard, compact view and isolation passed.')
    browser.close()
