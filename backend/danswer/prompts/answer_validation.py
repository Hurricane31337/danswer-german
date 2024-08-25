# The following prompts are used for verifying the LLM answer after it is already produced.
# Reflexion flow essentially. This feature can be toggled on/off
from danswer.configs.app_configs import CUSTOM_ANSWER_VALIDITY_CONDITIONS
from danswer.prompts.constants import ANSWER_PAT
from danswer.prompts.constants import QUESTION_PAT

ANSWER_VALIDITY_CONDITIONS = (
    """
1. Die Anfrage verlangt Informationen, die von Person zu Person unterschiedlich oder subjektiv \
sind. Wenn es keine allgemein gültige Antwort gibt, sollte das Sprachmodell nicht antworten, \
daher ist jede Antwort ungültig.
2. Die Antwort bezieht sich auf eine verwandte, aber andere Anfrage. Um hilfreich zu sein, \
könnte das Modell verwandte Informationen zu einer Abfrage liefern, die jedoch nicht mit der \
Abfrage des Benutzers übereinstimmen – dies ist ungültig.
3. Die Antwort ist nur eine Form von „ich weiß nicht“ oder „nicht genug Informationen“ ohne \
wesentliche zusätzliche nützliche Informationen. Eine Erklärung, warum es nicht weiß oder nicht \
antworten kann, ist ungültig.
"""
    if not CUSTOM_ANSWER_VALIDITY_CONDITIONS
    else "\n".join(
        [
            f"{indice+1}. {condition}"
            for indice, condition in enumerate(CUSTOM_ANSWER_VALIDITY_CONDITIONS)
        ]
    )
)

ANSWER_FORMAT = (
    """
1. Wahr oder Falsch
2. Wahr oder Falsch
3. Wahr oder Falsch
"""
    if not CUSTOM_ANSWER_VALIDITY_CONDITIONS
    else "\n".join(
        [
            f"{indice+1}. Wahr oder Falsch"
            for indice, _ in enumerate(CUSTOM_ANSWER_VALIDITY_CONDITIONS)
        ]
    )
)

ANSWER_VALIDITY_PROMPT = f"""
Du bist ein Assistent zur Identifizierung ungültiger Anfrage-/Antwortpaare aus einem großen Sprachmodell.
Das Anfrage-/Antwortpaar ist ungültig, wenn eine der folgenden Bedingungen Wahr ist:
{ANSWER_VALIDITY_CONDITIONS}

{QUESTION_PAT} {{user_query}}
{ANSWER_PAT} {{llm_answer}}

------------------------
Du MUSST GENAU im folgenden Format antworten:
```
{ANSWER_FORMAT}
Endgültige Antwort: Gültig oder Ungültig
```

Hinweis: Denke daran: Wenn IRGENDEINE der Bedingungen Wahr ist, ist es ungültig.
""".strip()


# Use the following for easy viewing of prompts
if __name__ == "__main__":
    print(ANSWER_VALIDITY_PROMPT)
