# The following prompts are used for the initial response before a chat history exists
# It is used also for the one shot direct QA flow
import json

from onyx.prompts.constants import DEFAULT_IGNORE_STATEMENT
from onyx.prompts.constants import FINAL_QUERY_PAT
from onyx.prompts.constants import GENERAL_SEP_PAT
from onyx.prompts.constants import QUESTION_PAT
from onyx.prompts.constants import THOUGHT_PAT


ONE_SHOT_SYSTEM_PROMPT = """
Du bist ein System zur Beantwortung von Fragen, das ständig lernt und sich verbessert.
Du kannst große Mengen an Text verarbeiten und verstehen und dieses Wissen nutzen, um \
genaue und detaillierte Antworten auf verschiedene Anfragen zu geben.
""".strip()

ONE_SHOT_TASK_PROMPT = """
Beantworte die abschließende Frage und berücksichtige dabei den obigen Kontext, falls \
relevant.
Ignoriere jeden Kontext, der für die Frage nicht relevant ist.
""".strip()


WEAK_MODEL_SYSTEM_PROMPT = """
Beantworte die Benutzeranfrage unter Verwendung des folgenden Quellendokuments.
""".lstrip()

WEAK_MODEL_TASK_PROMPT = """
Beantworte die nachstehende Benutzeranfrage basierend auf dem obigen Quellendokuments.
"""


REQUIRE_JSON = """
Du antwortest IMMER mit NUR einem JSON, das eine Antwort und Anführungszeichen enthält, \
das die Antwort bekräftigt.
""".strip()


JSON_HELPFUL_HINT = """
Hinweis: Gib die Antwort so DETAILLIERT wie möglich und antworte im JSON-Format! \
Anführungszeichen MÜSSEN EXAKTE Teilstrings aus den bereitgestellten Dokumenten sein!
""".strip()

CONTEXT_BLOCK = f"""
QUELLENDOKUMENTE:
{GENERAL_SEP_PAT}
{{context_docs_str}}
{GENERAL_SEP_PAT}
"""

HISTORY_BLOCK = f"""
KONVERSATIONSVERLAUF:
{GENERAL_SEP_PAT}
{{history_str}}
{GENERAL_SEP_PAT}
"""


# This has to be doubly escaped due to json containing { } which are also used for format strings
EMPTY_SAMPLE_JSON = {
    "answer": "Place your final answer here. It should be as DETAILED and INFORMATIVE as possible.",
    "quotes": [
        "each quote must be UNEDITED and EXACTLY as shown in the context documents!",
        "HINT, quotes are not shown to the user!",
    ],
}


# Default json prompt which can reference multiple docs and provide answer + quotes
# system_like_header is similar to system message, can be user provided or defaults to QA_HEADER
# context/history blocks are for context documents and conversation history, they can be blank
# task prompt is the task message of the prompt, can be blank, there is no default
JSON_PROMPT = f"""
{{system_prompt}}
{REQUIRE_JSON}
{{context_block}}{{history_block}}
{{task_prompt}}

BEISPIEL-ANTWORT:
```
{{{json.dumps(EMPTY_SAMPLE_JSON)}}}
```

{FINAL_QUERY_PAT.upper()}
{{user_query}}

{JSON_HELPFUL_HINT}
{{language_hint_or_none}}
""".strip()


# similar to the chat flow, but with the option of including a
# "conversation history" block
CITATIONS_PROMPT = f"""
Beziehe dich auf die folgenden Kontext-Dokumente wenn du mir antwortest.{DEFAULT_IGNORE_STATEMENT}

KONTEXT:
{GENERAL_SEP_PAT}
{{context_docs_str}}
{GENERAL_SEP_PAT}

{{history_block}}{{task_prompt}}

{QUESTION_PAT.upper()}
{{user_query}}
"""

# with tool calling, the documents are in a separate "tool" message
# NOTE: need to add the extra line about "getting right to the point" since the
# tool calling models from OpenAI tend to be more verbose
CITATIONS_PROMPT_FOR_TOOL_CALLING = f"""
Beziehe dich auf die bereitgestellten Kontextdokumente, wenn du mir antwortest.{DEFAULT_IGNORE_STATEMENT} \
Du solltest immer gleich auf den Punkt kommen und niemals überflüssige Worte verwenden.

{{history_block}}{{task_prompt}}

{QUESTION_PAT.upper()}
{{user_query}}
"""


# This is only for visualization for the users to specify their own prompts
# The actual flow does not work like this
PARAMATERIZED_PROMPT = f"""
{{system_prompt}}

KONTEXT:
{GENERAL_SEP_PAT}
{{context_docs_str}}
{GENERAL_SEP_PAT}

{{task_prompt}}

{QUESTION_PAT.upper()} {{user_query}}
ANTWORT:
""".strip()

PARAMATERIZED_PROMPT_WITHOUT_CONTEXT = f"""
{{system_prompt}}

{{task_prompt}}

{QUESTION_PAT.upper()} {{user_query}}
ANTWORT:
""".strip()


# CURRENTLY DISABLED, CANNOT USE THIS ONE
# Default chain-of-thought style json prompt which uses multiple docs
# This one has a section for the LLM to output some non-answer "thoughts"
# COT (chain-of-thought) flow basically
COT_PROMPT = f"""
{ONE_SHOT_SYSTEM_PROMPT}

KONTEXT:
{GENERAL_SEP_PAT}
{{context_docs_str}}
{GENERAL_SEP_PAT}

Du MUSST im folgenden Format antworten:
```
{THOUGHT_PAT} Nutze diesen Abschnitt als Notizblock, um dir die Antwort zu erarbeiten.

{{{json.dumps(EMPTY_SAMPLE_JSON)}}}
```

{QUESTION_PAT.upper()} {{user_query}}
{JSON_HELPFUL_HINT}
{{language_hint_or_none}}
""".strip()


# User the following for easy viewing of prompts
if __name__ == "__main__":
    print(JSON_PROMPT)  # Default prompt used in the Onyx UI flow
