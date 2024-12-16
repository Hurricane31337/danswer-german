# These prompts are to support tool calling. Currently not used in the main flow or via any configs
# The current generation of LLM is too unreliable for this task.
# Onyx retrieval call as a tool option
DANSWER_TOOL_NAME = "Aktuelle Suche"
DANSWER_TOOL_DESCRIPTION = (
    "Ein Suchwerkzeug, das Informationen zu jedem Thema finden kann "
    "einschließlich aktueller und proprietärer Kenntnisse."
)


# Tool calling format inspired from LangChain
TOOL_TEMPLATE = """
WERKZEUGE
------
Du kannst Werkzeuge verwenden, um Informationen nachzuschlagen, die hilfreich sein könnten, um die ursprüngliche \
Frage des Benutzers zu beantworten. Die verfügbaren Werkzeuge sind:

{tool_overviews}

ANTWORTFORMAT-ANWEISUNGEN 
----------------------------
Bei der Antwort gib bitte eine Antwort in einem der beiden Formate aus:

**Option 1:**
Nutze dies, wenn du ein Werkzeug verwenden möchtest. Markdown-Code-Snippet formatiert nach folgendem Schema:

```json
{{
    "action": string, \\ Die auszuführende Aktion. {tool_names}
    "action_input": string \\ Die Eingabe für die Aktion
}}
```

**Option #2:**
Nutze dies, wenn du dem Benutzer direkt antworten möchtest. Markdown-Code-Snippet formatiert nach folgendem Schema:

```json
{{
    "action": "Final Answer",
    "action_input": string \\ Hier solltest du eintragen, was du dem Benutzer zurückgeben möchtest
}}
```
"""

# For the case where the user has not configured any tools to call, but still using the tool-flow
# expected format
TOOL_LESS_PROMPT = """
Antworte mit einem Markdown-Code-Snippet im folgenden Schema:

```json
{{
    "action": "Final Answer",
    "action_input": string \\ Hier solltest du eintragen, was du dem Benutzer zurückgeben möchtest
}}
```
"""


# Second part of the prompt to include the user query
USER_INPUT = """
BENUTZEREINGABE
--------------------
Hier ist die Benutzereingabe \
(denk daran, mit einem Markdown-Code-Snippet eines JSON-Blocks mit einer einzigen Aktion zu antworten, und NICHTS anderes):

{user_input}
"""


# After the tool call, this is the following message to get a final answer
# Tools are not chained currently, the system must provide an answer after calling a tool
TOOL_FOLLOWUP = """
WERKZEUG-ANTWORT:
---------------------
{tool_output}

BENUTZEREINGABE
--------------------
Ok, was ist also die Antwort auf meinen letzten Kommentar? Wenn du Informationen aus den Werkzeugen verwendest, musst du \
sie ausdrücklich erwähnen ohne die Werkzeug-Namen zu nennen – ich habe alle WERKZEUG-ANTWORTEN vergessen!
Wenn die Werkzeug-Antwort nicht nützlich ist, ignoriere sie komplett.
{optional_reminder}{hint}
WICHTIG! Du MUSST mit einem Markdown-Code-Snippet eines JSON-Blocks mit einer einzigen Aktion antworten, und NICHTS anderes.
"""


# If no tools were used, but retrieval is enabled, then follow up with this message to get the final answer
TOOL_LESS_FOLLOWUP = """
Beziehe dich bei der Beantwortung meiner endgültigen Frage auf die folgenden Dokumente. Ignoriere alle Dokumente, die nicht relevant sind.

KONTEXT-DOKUMENTE:
---------------------
{context_str}

ENDGÜLTIGE FRAGE:
--------------------
{user_query}

{hint_text}
"""
