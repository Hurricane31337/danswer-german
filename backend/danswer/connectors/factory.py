from typing import Any
from typing import Type

from sqlalchemy.orm import Session

from backend.danswer.configs.constants import DocumentSource
from backend.danswer.connectors.axero.connector import AxeroConnector
from backend.danswer.connectors.blob.connector import BlobStorageConnector
from backend.danswer.connectors.bookstack.connector import BookstackConnector
from backend.danswer.connectors.clickup.connector import ClickupConnector
from backend.danswer.connectors.confluence.connector import ConfluenceConnector
from backend.danswer.connectors.danswer_jira.connector import JiraConnector
from backend.danswer.connectors.discourse.connector import DiscourseConnector
from backend.danswer.connectors.document360.connector import Document360Connector
from backend.danswer.connectors.dropbox.connector import DropboxConnector
from backend.danswer.connectors.file.connector import LocalFileConnector
from backend.danswer.connectors.github.connector import GithubConnector
from backend.danswer.connectors.gitlab.connector import GitlabConnector
from backend.danswer.connectors.gmail.connector import GmailConnector
from backend.danswer.connectors.gong.connector import GongConnector
from backend.danswer.connectors.google_drive.connector import GoogleDriveConnector
from backend.danswer.connectors.google_site.connector import GoogleSitesConnector
from backend.danswer.connectors.guru.connector import GuruConnector
from backend.danswer.connectors.hubspot.connector import HubSpotConnector
from backend.danswer.connectors.interfaces import BaseConnector
from backend.danswer.connectors.interfaces import EventConnector
from backend.danswer.connectors.interfaces import LoadConnector
from backend.danswer.connectors.interfaces import PollConnector
from backend.danswer.connectors.linear.connector import LinearConnector
from backend.danswer.connectors.loopio.connector import LoopioConnector
from backend.danswer.connectors.mediawiki.wiki import MediaWikiConnector
from backend.danswer.connectors.models import InputType
from backend.danswer.connectors.notion.connector import NotionConnector
from backend.danswer.connectors.productboard.connector import ProductboardConnector
from backend.danswer.connectors.requesttracker.connector import RequestTrackerConnector
from backend.danswer.connectors.salesforce.connector import SalesforceConnector
from backend.danswer.connectors.sharepoint.connector import SharepointConnector
from backend.danswer.connectors.slab.connector import SlabConnector
from backend.danswer.connectors.slack.connector import SlackPollConnector
from backend.danswer.connectors.slack.load_connector import SlackLoadConnector
from backend.danswer.connectors.teams.connector import TeamsConnector
from backend.danswer.connectors.web.connector import WebConnector
from backend.danswer.connectors.wikipedia.connector import WikipediaConnector
from backend.danswer.connectors.zendesk.connector import ZendeskConnector
from backend.danswer.connectors.zulip.connector import ZulipConnector
from backend.danswer.db.credentials import backend_update_credential_json
from backend.danswer.db.models import Credential


class ConnectorMissingException(Exception):
    pass


def identify_connector_class(
    source: DocumentSource,
    input_type: InputType | None = None,
) -> Type[BaseConnector]:
    connector_map = {
        DocumentSource.WEB: WebConnector,
        DocumentSource.FILE: LocalFileConnector,
        DocumentSource.SLACK: {
            InputType.LOAD_STATE: SlackLoadConnector,
            InputType.POLL: SlackPollConnector,
        },
        DocumentSource.GITHUB: GithubConnector,
        DocumentSource.GMAIL: GmailConnector,
        DocumentSource.GITLAB: GitlabConnector,
        DocumentSource.GOOGLE_DRIVE: GoogleDriveConnector,
        DocumentSource.BOOKSTACK: BookstackConnector,
        DocumentSource.CONFLUENCE: ConfluenceConnector,
        DocumentSource.JIRA: JiraConnector,
        DocumentSource.PRODUCTBOARD: ProductboardConnector,
        DocumentSource.SLAB: SlabConnector,
        DocumentSource.NOTION: NotionConnector,
        DocumentSource.ZULIP: ZulipConnector,
        DocumentSource.REQUESTTRACKER: RequestTrackerConnector,
        DocumentSource.GURU: GuruConnector,
        DocumentSource.LINEAR: LinearConnector,
        DocumentSource.HUBSPOT: HubSpotConnector,
        DocumentSource.DOCUMENT360: Document360Connector,
        DocumentSource.GONG: GongConnector,
        DocumentSource.GOOGLE_SITES: GoogleSitesConnector,
        DocumentSource.ZENDESK: ZendeskConnector,
        DocumentSource.LOOPIO: LoopioConnector,
        DocumentSource.DROPBOX: DropboxConnector,
        DocumentSource.SHAREPOINT: SharepointConnector,
        DocumentSource.TEAMS: TeamsConnector,
        DocumentSource.SALESFORCE: SalesforceConnector,
        DocumentSource.DISCOURSE: DiscourseConnector,
        DocumentSource.AXERO: AxeroConnector,
        DocumentSource.CLICKUP: ClickupConnector,
        DocumentSource.MEDIAWIKI: MediaWikiConnector,
        DocumentSource.WIKIPEDIA: WikipediaConnector,
        DocumentSource.S3: BlobStorageConnector,
        DocumentSource.R2: BlobStorageConnector,
        DocumentSource.GOOGLE_CLOUD_STORAGE: BlobStorageConnector,
        DocumentSource.OCI_STORAGE: BlobStorageConnector,
    }
    connector_by_source = connector_map.get(source, {})

    if isinstance(connector_by_source, dict):
        if input_type is None:
            # If not specified, default to most exhaustive update
            connector = connector_by_source.get(InputType.LOAD_STATE)
        else:
            connector = connector_by_source.get(input_type)
    else:
        connector = connector_by_source
    if connector is None:
        raise ConnectorMissingException(f"Connector not found for source={source}")

    if any(
        [
            input_type == InputType.LOAD_STATE
            and not issubclass(connector, LoadConnector),
            input_type == InputType.POLL and not issubclass(connector, PollConnector),
            input_type == InputType.EVENT and not issubclass(connector, EventConnector),
        ]
    ):
        raise ConnectorMissingException(
            f"Connector for source={source} does not accept input_type={input_type}"
        )
    return connector


def instantiate_connector(
    source: DocumentSource,
    input_type: InputType,
    connector_specific_config: dict[str, Any],
    credential: Credential,
    db_session: Session,
) -> BaseConnector:
    connector_class = identify_connector_class(source, input_type)
    connector = connector_class(**connector_specific_config)
    new_credentials = connector.load_credentials(credential.credential_json)

    if new_credentials is not None:
        backend_update_credential_json(credential, new_credentials, db_session)

    return connector
