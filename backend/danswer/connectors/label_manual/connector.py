from typing import Tuple
import hashlib
from datetime import datetime

from urllib.parse import urlparse
from playwright.sync_api import Playwright, BrowserContext, Cookie

from danswer.configs.constants import DocumentSource
from danswer.connectors.web.connector import WebConnector
from danswer.connectors.web.connector import WEB_CONNECTOR_VALID_SETTINGS
from danswer.utils.logger import setup_logger

logger = setup_logger()


def compute_cookie_content(version: int) -> dict:
    """
    Compute a dynamic cookie value based on the current date and a provided version.
    This is highly specific to 'https://handbuch.mylabelwin.de'.
    """
    return {
        "name": "guid",
        "value": hashlib.md5(datetime.now().strftime("%d.%m.%Y").encode()).hexdigest(),
        "domain": "handbuch.mylabelwin.de",
        "path": f"/{version}",  # Cookie path based on the manual version
    }


def extract_version_from_url(base_url: str) -> int:
    """
    Extracts the version number from the base_url. Assumes the version is
    always the last segment of the path, for example: https://handbuch.mylabelwin.de/100/ -> 100.

    Raises:
        ValueError if the version cannot be parsed from the URL.
    """
    parsed_url = urlparse(base_url)

    # Split the path on slashes and filter out empty components
    path_components = list(filter(None, parsed_url.path.split("/")))

    if not path_components:
        logger.warning(f"No valid path component in URL {base_url}")
        return 100

    try:
        # Assume the last part of the path is the version, e.g., '100'
        version = int(path_components[-1])
        return version
    except ValueError:
        logger.warning(f"Invalid version found in URL {base_url}")
        return 100


# Create a new class that inherits from WebConnector
class LabelManualConnector(WebConnector):
    def __init__(self, base_url: str, *args, **kwargs):
        """
        This constructor initializes the LabelManualConnector and automatically extracts
        the version from the base_url. No need to pass the version separately.

        base_url: The full URL of the label manual, including version, e.g., https://handbuch.mylabelwin.de/100/
        """
        try:
            self.base_url = base_url
            logger.info(f"Initializing LabelManualConnector with base_url: {self.base_url}")

            # Pass the base_url and other arguments to the parent WebConnector
            super().__init__(base_url=self.base_url, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error initializing LabelManualConnector: {e}")
            raise

    def load_from_state(self):
        """
        Override load_from_state to ensure that we handle both document retrieval and pagination correctly.
        Inheriting the document loading structure ensures that pagination logic follows what WebConnector uses.
        """
        try:
            # Use the inherited `load_from_state` logic, which already handles paginated data.
            logger.info("Entering LabelManualConnector.load_from_state")
            # Compute the cookie content based on the extracted version
            cookie_content = compute_cookie_content(extract_version_from_url(self.base_url))
            cookies = [cookie_content]  # Create a list of dictionary
            logger.info(f"Set cookie: {cookies}")
            document_batches = super().load_from_state(DocumentSource.LABEL_MANUAL, cookies)
            logger.info(f"Document Batches: {document_batches}")
            return document_batches

        except Exception as e:
            # Handle any potential paging misconfigurations or cookie mismatches here.
            logger.error(f"Error in LabelManualConnector.load_from_state: {e}")
            raise RuntimeError(f"Failed to load the manual content: {e}")


# Main entry point for manual testing or running the connector script directly
if __name__ == "__main__":
    # Example usage where the version is inferred from the URL
    connector = LabelManualConnector(
        base_url="https://handbuch.mylabelwin.de/100/",
        web_connector_type=WEB_CONNECTOR_VALID_SETTINGS.RECURSIVE.value,
    )
    document_batches = connector.load_from_state()
    for batch in document_batches:
        print(batch)
