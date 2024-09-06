from typing import Tuple
import hashlib
from datetime import datetime

# Add this import at the top of your file
from playwright.sync_api import Cookie, Playwright, BrowserContext

from backend.danswer.connectors.web.connector import WebConnector, WEB_CONNECTOR_VALID_SETTINGS


def compute_cookie_content(version: int) -> dict:
    return {
        "name": "guid",
        "value": hashlib.md5(datetime.now().strftime("%d.%m.%Y").encode()).hexdigest(),
        "domain": "handbuch.mylabelwin.de",
        "path": f"/{version}"
    }

class LABEL_MANUAL_CONNECTOR_VALID_SETTINGS(WEB_CONNECTOR_VALID_SETTINGS):
    VERSION = 100

# Create a new class that inherits from WebConnector
class LabelManualConnector(WebConnector):
    def __init__(self, version: int, *args, **kwargs):
        super().__init__(version=version, *args, **kwargs)
        self.cookie = compute_cookie_content(version)

    def start_playwright(self) -> Tuple[Playwright, BrowserContext]:
        playwright, context = super().start_playwright()

        # Add the cookie to the context
        context.add_cookies([Cookie(**self.cookie)])

        return playwright, context


# Modify the main block to use LabelManualConnector instead of WebConnector
if __name__ == "__main__":
    connector = LabelManualConnector(100, "https://handbuch.mylabelwin.de/100/")
    document_batches = connector.load_from_state()
    print(next(document_batches))