from typing import Tuple
import io
import hashlib
from datetime import datetime
from typing import List
from typing import Dict
from typing import Optional

import requests
import bs4
from bs4 import BeautifulSoup
from urllib.parse import urlparse

from openpyxl.styles.builtins import title
from playwright.sync_api import Playwright, BrowserContext, Cookie

from onyx.configs.constants import DocumentSource
from onyx.connectors.web.connector import WebConnector, start_playwright, protected_url_check, check_internet_connection, read_pdf_file, _get_datetime_from_last_modified_header, get_internal_links
from onyx.connectors.web.connector import WEB_CONNECTOR_VALID_SETTINGS
from onyx.connectors.interfaces import GenerateDocumentsOutput
from onyx.connectors.models import Document
from onyx.connectors.models import Section
from onyx.file_processing.html_utils import web_html_cleanup, ParsedHTML
from onyx.utils.logger import setup_logger

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

    def load_from_state_LabelManual(self, document_source: Optional[DocumentSource] = DocumentSource.WEB, cookies: Optional[List[Dict]] = None) -> GenerateDocumentsOutput:
        """Traverses through all pages found on the website
                and converts them into documents"""
        visited_links: set[str] = set()
        to_visit: list[str] = self.to_visit_list

        if not to_visit:
            raise ValueError("No URLs to visit")

        base_url = to_visit[0]  # For the recursive case
        doc_batch: list[Document] = []

        # Needed to report error
        at_least_one_doc = False
        last_error = None

        playwright, context = start_playwright()
        if cookies:
            context.add_cookies(cookies)
        restart_playwright = False
        while to_visit:
            current_url = to_visit.pop()
            if current_url in visited_links:
                continue
            visited_links.add(current_url)

            try:
                protected_url_check(current_url)
            except Exception as e:
                last_error = f"Invalid URL {current_url} due to {e}"
                logger.warning(last_error)
                continue

            logger.info(f"Visiting {current_url}")

            try:
                check_internet_connection(current_url)
                if restart_playwright:
                    playwright, context = start_playwright()
                    if cookies:
                        context.add_cookies(cookies)
                    restart_playwright = False

                if current_url.split(".")[-1] == "pdf":
                    # PDF files are not checked for links
                    response = requests.get(current_url)
                    page_text, metadata = read_pdf_file(
                        file=io.BytesIO(response.content)
                    )
                    last_modified = response.headers.get("Last-Modified")

                    doc_batch.append(
                        Document(
                            id=current_url,
                            sections=[Section(link=current_url, text=page_text)],
                            source=document_source,
                            semantic_identifier=current_url.split("/")[-1],
                            metadata=metadata,
                            doc_updated_at=_get_datetime_from_last_modified_header(
                                last_modified
                            )
                            if last_modified
                            else None,
                        )
                    )
                    continue

                page = context.new_page()
                page_response = page.goto(current_url)
                last_modified = (
                    page_response.header_value("Last-Modified")
                    if page_response
                    else None
                )
                final_page = page.url
                if final_page != current_url:
                    logger.info(f"Redirected to {final_page}")
                    protected_url_check(final_page)
                    current_url = final_page
                    if current_url in visited_links:
                        logger.info("Redirected page already indexed")
                        continue
                    visited_links.add(current_url)

                content = page.content()
                soup = BeautifulSoup(content, "html.parser")

                if self.recursive:
                    soup_without_print = soup
                    [print_item.extract() for print_item in soup_without_print.find_all("li", {'class': 'm-controlButtons__item__print'})]
                    internal_links = get_internal_links(base_url, current_url, soup_without_print)
                    for link in internal_links:
                        if link not in visited_links:
                            to_visit.append(link)

                if page_response and str(page_response.status)[0] in ("4", "5"):
                    last_error = f"Skipped indexing {current_url} due to HTTP {page_response.status} response"
                    logger.info(last_error)
                    continue

                title = None
                try:
                    title = " → ".join([li.extract().text for li in soup.find("div", {"id": "article"}).find("div", {"id": "headerSide__nav__breadCrumbs"}).find_all("li", {'class': 'b-breadCrumbs__item'})])
                except Exception as e:
                    logger.error(f"Error in LabelManualConnector.load_from_state_LabelManual: {e}")

                article_content = soup
                try:
                    article_content = soup.find("div", {"id": "hiddenContent"})
                    [print_item.extract() for print_item in article_content.find_all("li", {'class': 'm-controlButtons__item__print'})]
                    [noscript.extract() for noscript in article_content.find_all("noscript")]
                except Exception as e:
                    logger.error(f"Error in LabelManualConnector.load_from_state_LabelManual: {e}")


                parsed_html = web_html_cleanup(article_content, self.mintlify_cleanup)

                #if parsed_html.title is None:
                parsed_html.title = title

                doc_batch.append(
                    Document(
                        id=current_url,
                        sections=[
                            Section(link=current_url, text=parsed_html.cleaned_text)
                        ],
                        source=document_source,
                        semantic_identifier=parsed_html.title or current_url,
                        metadata={},
                        doc_updated_at=_get_datetime_from_last_modified_header(
                            last_modified
                        )
                        if last_modified
                        else None,
                    )
                )

                page.close()
            except Exception as e:
                last_error = f"Failed to fetch '{current_url}': {e}"
                logger.error(last_error)
                playwright.stop()
                restart_playwright = True
                continue

            if len(doc_batch) >= self.batch_size:
                playwright.stop()
                restart_playwright = True
                at_least_one_doc = True
                yield doc_batch
                doc_batch = []

        if doc_batch:
            playwright.stop()
            at_least_one_doc = True
            yield doc_batch

        if not at_least_one_doc:
            if last_error:
                raise RuntimeError(last_error)
            raise RuntimeError("No valid pages found.")

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
            document_batches = self.load_from_state_LabelManual(DocumentSource.LABEL_MANUAL, cookies)
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
        #for document in batch:
            # if document is not None and document.text is not None:
            #     print("Title: " + document.title)
            # for section in document.sections:
            #     if section is not None:
            #         if section.text is not None:
            #             print(section.title)
            #         if section.content is not None:
            #             print(section.content)

