from typing_extensions import TypedDict  # noreorder

from pydantic import BaseModel

from danswer.prompts.chat_tools import DANSWER_TOOL_DESCRIPTION
from danswer.prompts.chat_tools import DANSWER_TOOL_NAME
from danswer.prompts.chat_tools import TOOL_FOLLOWUP
from danswer.prompts.chat_tools import TOOL_LESS_FOLLOWUP
from danswer.prompts.chat_tools import TOOL_LESS_PROMPT
from danswer.prompts.chat_tools import TOOL_TEMPLATE
from danswer.prompts.chat_tools import USER_INPUT


class ToolInfo(TypedDict):
    name: str
    description: str


class DanswerChatModelOut(BaseModel):
    model_raw: str
    action: str
    action_input: str


def call_tool(
    model_actions: DanswerChatModelOut,
) -> str:
    raise NotImplementedError("Momentan gibt es keine zusätzlichen Werkzeug-Integrationen")


def form_user_prompt_text(
    query: str,
    tool_text: str | None,
    hint_text: str | None,
    user_input_prompt: str = USER_INPUT,
    tool_less_prompt: str = TOOL_LESS_PROMPT,
) -> str:
    user_prompt = tool_text or tool_less_prompt

    user_prompt += user_input_prompt.format(user_input=query)

    if hint_text:
        if user_prompt[-1] != "\n":
            user_prompt += "\n"

        user_prompt += "\nHinweis: " + hint_text
    return user_prompt.strip()


def form_tool_section_text(
    tools: list[ToolInfo] | None, retrieval_enabled: bool, template: str = TOOL_TEMPLATE
) -> str | None:
    if not tools and not retrieval_enabled:
        return None

    if retrieval_enabled and tools:
        tools.append(
            {"name": DANSWER_TOOL_NAME, "description": DANSWER_TOOL_DESCRIPTION}
        )

    tools_intro = []
    if tools:
        num_tools = len(tools)
        for tool in tools:
            description_formatted = tool["description"].replace("\n", " ")
            tools_intro.append(f"> {tool['name']}: {description_formatted}")

        prefix = "Muss eines davon sein: " if num_tools > 1 else "Muss sein: "

        tools_intro_text = "\n".join(tools_intro)
        tool_names_text = prefix + ", ".join([tool["name"] for tool in tools])

    else:
        return None

    return template.format(
        tool_overviews=tools_intro_text, tool_names=tool_names_text
    ).strip()


def form_tool_followup_text(
    tool_output: str,
    query: str,
    hint_text: str | None,
    tool_followup_prompt: str = TOOL_FOLLOWUP,
    ignore_hint: bool = False,
) -> str:
    # If multi-line query, it likely confuses the model more than helps
    if "\n" not in query:
        optional_reminder = f"\nZur Erinnerung – meine Anfrage war: {query}\n"
    else:
        optional_reminder = ""

    if not ignore_hint and hint_text:
        hint_text_spaced = f"\nHinweis: {hint_text}\n"
    else:
        hint_text_spaced = ""

    return tool_followup_prompt.format(
        tool_output=tool_output,
        optional_reminder=optional_reminder,
        hint=hint_text_spaced,
    ).strip()


def form_tool_less_followup_text(
    tool_output: str,
    query: str,
    hint_text: str | None,
    tool_followup_prompt: str = TOOL_LESS_FOLLOWUP,
) -> str:
    hint = f"Hinweis: {hint_text}" if hint_text else ""
    return tool_followup_prompt.format(
        context_str=tool_output, user_query=query, hint_text=hint
    ).strip()
