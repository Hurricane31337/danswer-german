import os
from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from onyx.main import fetch_versioned_implementation
from onyx.utils.logger import setup_logger

logger = setup_logger()


@pytest.fixture(scope="function")
def client() -> Generator[TestClient, Any, None]:
    # Set environment variables
    os.environ["ENABLE_PAID_ENTERPRISE_EDITION_FEATURES"] = "True"

    # Initialize TestClient with the FastAPI app
    app = fetch_versioned_implementation(
        module="onyx.main", attribute="get_application"
    )()
    client = TestClient(app)
    yield client


@pytest.mark.skip(
    reason="enable when we have a testing environment with preloaded data"
)
def test_handle_simplified_chat_message(client: TestClient) -> None:
    req: dict[str, Any] = {}

    req["persona_id"] = 0
    req["description"] = "pytest"
    response = client.post("/chat/create-chat-session", json=req)
    chat_session_id = response.json()["chat_session_id"]

    req = {}
    req["chat_session_id"] = chat_session_id
    req["message"] = "hello"

    response = client.post("/chat/send-message-simple-api", json=req)
    assert response.status_code == 200


@pytest.mark.skip(
    reason="enable when we have a testing environment with preloaded data"
)
def test_handle_send_message_simple_with_history(client: TestClient) -> None:
    req: dict[str, Any] = {}
    messages = []
    messages.append({"message": "Welche Art von Fragen kannst du mir beantworten?"})
    # messages.append({"message":
    #                  "I'd be happy to assist you with a wide range of questions related to Ramp's expense management platform. "
    #                  "I can help with topics such as:\n\n"
    #                  "1. Setting up and managing your Ramp account\n"
    #                  "2. Using Ramp cards and making purchases\n"
    #                  "3. Submitting and reviewing expenses\n"
    #                  "4. Understanding Ramp's features and benefits\n"
    #                  "5. Navigating the Ramp dashboard and mobile app\n"
    #                  "6. Managing team spending and budgets\n"
    #                  "7. Integrating Ramp with accounting software\n"
    #                  "8. Troubleshooting common issues\n\n"
    #                  "Feel free to ask any specific questions you have about using Ramp, "
    #                  "and I'll do my best to provide clear and helpful answers. "
    #                  "Is there a particular area you'd like to know more about?",
    #                  "role": "assistant"})
    # req["prompt_id"] = 9
    # req["persona_id"] = 6

    # Yoda
    req["persona_id"] = 1
    req["prompt_id"] = 4
    messages.append(
        {
            "message": "Fragen für dich beantworten, ich kann. "
            "Über viele Themen, Wissen ich habe. "
            "Aber spezifisch für die bereitgestellten Dokumente, begrenzt sind meine Antworten. "
            "Fragen du kannst über:\n\n"
            "- Nutzerinterviews und Vertrauensbildung mit Teilnehmern\n"
            "- Effektives Design von Umfragen und Umfragefragen\n"
            "- Ansätze zur Produktanalyse\n"
            "- Rekrutierung von Teilnehmern für Forschung\n"
            "- Diskussionsleitfäden für Nutzerinterviews\n"
            "- Arten von Umfragefragen\n\n"
            "Mehr es geben mag, aber auf diese Bereiche der gegebene Kontext sich fokussiert. "
            "Spezifische Fragen du hast, fragen du solltst. Führen ich dich werden, so gut ich kann.",
            "role": "assistant",
        }
    )
    # messages.append({"message": "Where can I pilot a survey?"})

    # messages.append({"message": "How many data points should I collect to validate my solution?"})
    messages.append({"message": "Wofür wird Solution Validation Research gebraucht?"})

    req["messages"] = messages

    response = client.post("/chat/send-message-simple-with-history", json=req)
    assert response.status_code == 200

    resp_json = response.json()

    # persona must have LLM relevance enabled for this to pass
    assert len(resp_json["llm_selected_doc_indices"]) > 0
