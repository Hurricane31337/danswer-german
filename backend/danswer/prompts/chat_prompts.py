from danswer.prompts.constants import GENERAL_SEP_PAT
from danswer.prompts.constants import QUESTION_PAT

REQUIRE_CITATION_STATEMENT = """
Zitiere relevante Aussagen DIREKT IM SATZ unter Verwendung des Formats [1], [2], [3] usw., um auf die Dokumentnummer zu verweisen, \
gib KEIN Quellenverzeichnis am Ende und KEINE Links nach den Zitaten an.
""".rstrip()

NO_CITATION_STATEMENT = """
Gib keine Zitate an, selbst wenn es im Chatverlauf Beispiele gibt.
""".rstrip()

CITATION_REMINDER = """
Denke daran, direkte Zitate im Format [1], [2], [3] usw. anzugeben.
"""

ADDITIONAL_INFO = "\n\nAdditional Information:\n\t- {datetime_info}."


CHAT_USER_PROMPT = f"""
Beziehe dich auf die folgenden Kontext-Dokumente, wenn du mir antwortest.{{optional_ignore_statement}}
KONTEXT:
{GENERAL_SEP_PAT}
{{context_docs_str}}
{GENERAL_SEP_PAT}

{{task_prompt}}

{QUESTION_PAT.upper()}
{{user_query}}
""".strip()


CHAT_USER_CONTEXT_FREE_PROMPT = f"""
{{task_prompt}}

{QUESTION_PAT.upper()}
{{user_query}}
""".strip()


# Design considerations for the below:
# - In case of uncertainty, favor yes search so place the "yes" sections near the start of the
#   prompt and after the no section as well to deemphasize the no section
# - Conversation history can be a lot of tokens, make sure the bulk of the prompt is at the start
#   or end so the middle history section is relatively less paid attention to than the main task
# - Works worse with just a simple yes/no, seems asking it to produce "search" helps a bit, can
#   consider doing COT for this and keep it brief, but likely only small gains.
SKIP_SEARCH = "Suche Überspringen"
YES_SEARCH = "Suche Durchführen"

AGGRESSIVE_SEARCH_TEMPLATE = f"""
Bestimme anhand des Gesprächsverlaufs und der Folgeanfrage, ob das System ein externes \
Suchwerkzeug aufrufen sollte, um die letzte Benutzereingabe besser beantworten zu können.
Deine Standardantwort lautet {YES_SEARCH}.

Antworte „{SKIP_SEARCH}", wenn entweder:
- Es gibt genügend Informationen im Chatverlauf, um die Anfrage VOLLSTÄNDIG und GENAU zu \
beantworten UND zusätzliche Informationen oder Details wenig oder gar keinen Nutzen bringen würden.
- Die Eingabe ist eine Art von Abfrage, die keine zusätzlichen Informationen erfordert.

Konversationsverlauf:
{GENERAL_SEP_PAT}
{{chat_history}}
{GENERAL_SEP_PAT}

Wenn du dir auch nur leicht unsicher bist, antworte mit {YES_SEARCH}.
Antworte EXAKT und WIRKLICH NUR mit „{YES_SEARCH}“ oder „{SKIP_SEARCH}“

Folgeanfrage:
{{final_query}}
""".strip()


# TODO, templatize this so users don't need to make code changes to use this
AGGRESSIVE_SEARCH_TEMPLATE_LLAMA2 = f"""
Du bist ein Experte für ein Entscheidungs-System. Anhand des Gesprächsverlaufs und einer Folgeanfrage \
bestimmst du, ob das System ein externes Suchwerkzeug aufrufen soll, um die letzte Benutzereingabe \
besser beantworten zu können.

Deine Standardantwort lautet {YES_SEARCH}.
Wenn du dir auch nur leicht unsicher bist, antworte mit {YES_SEARCH}.

Antworte mit „{SKIP_SEARCH}“, wenn einer dieser Punkte zutrifft:
- Es gibt genügend Informationen im Chatverlauf, um die Anfrage VOLLSTÄNDIG und GENAU zu beantworten.
- Es handelt sich um eine Anfrage, für deren Bearbeitung keine weiteren Informationen erforderlich sind.
- Du bist dir bei der Frage absolut sicher und die Antwort oder die Frage ist nicht mehrdeutig.

Konversationsverlauf:
{GENERAL_SEP_PAT}
{{chat_history}}
{GENERAL_SEP_PAT}

Antworte EXAKT und WIRKLICH NUR mit „{YES_SEARCH}“ oder „{SKIP_SEARCH}“

Folgeanfrage:
{{final_query}}
""".strip()

REQUIRE_SEARCH_SINGLE_MSG = f"""
Bestimme anhand des Gesprächsverlaufs und einer Folgeanfrage, ob das System ein externes Suchwerkzeug \
aufrufen sollte, um die letzte Benutzereingabe besser beantworten zu können.

Antworte „{YES_SEARCH}“, wenn:
- Spezifische Details oder zusätzliches Wissen zu einer besseren Antwort führen könnten.
- Es gibt neue oder unbekannte Begriffe oder es besteht Unklarheit darüber, worauf sich der \
Benutzer bezieht.
- Wenn das Lesen eines zuvor zitierten oder erwähnten Dokuments nützlich sein könnte.

Antworte „{SKIP_SEARCH}“, wenn:
- Es gibt genügend Informationen im Chatverlauf, um die Anfrage VOLLSTÄNDIG und GENAU zu \
beantworten und zusätzliche Informationen oder Details würden wenig bis keinen Nutzen bringen.
- Die Anfrage ist eine Aufgabe, für deren Bearbeitung keine zusätzlichen Informationen \
erforderlich sind.

{GENERAL_SEP_PAT}
Konversationsverlauf:
{{chat_history}}
{GENERAL_SEP_PAT}

Selbst wenn das Thema schon behandelt wurde – wenn mehr spezifische Details nützlich sein \
könnten, antworte mit {YES_SEARCH}.
Wenn du dir unsicher bist, antworte mit {YES_SEARCH}.

Antworte EXAKT und WIRKLICH NUR mit „{YES_SEARCH}“ oder „{SKIP_SEARCH}“

Folgeanfrage:
{{final_query}}
""".strip()


HISTORY_QUERY_REPHRASE = f"""
Formuliere die folgende Konversation und eine Folgeeingabe in eine KURZE, eigenständige Abfrage \
(die alle relevanten Kontexte aus vorherigen Nachrichten erfasst) für einen Vektorspeicher um.
WICHTIG: BEARBEITE DIE ABFRAGE SO, DASS SIE SO PRÄGNANT WIE MÖGLICH IST. Antworte mit einer \
kurzen, komprimierten Phrase, die hauptsächlich aus Schlüsselwörtern besteht, statt mit einem \
vollständigen Satz.
Wenn sich das Thema eindeutig ändert, ignoriere die vorherigen Nachrichten.
Entferne alle Informationen, die für die Suchaufgabe nicht relevant sind.
Wenn die Folgenachricht ein Fehler oder ein Codeausschnitt ist, wiederhole dieselbe Eingabe EXAKT.

{GENERAL_SEP_PAT}
Chatverlauf:
{{chat_history}}
{GENERAL_SEP_PAT}

Folgeanfrage: {{question}}
Eigenständige Frage (beantworte nur die kurze kombinierte Anfrage):
""".strip()

INTERNET_SEARCH_QUERY_REPHRASE = f"""
Formuliere die folgende Konversation und eine Folgeanfrage in eine KURZE, eigenständige Abfrage um, \
die für eine Internetsuchmaschine geeignet ist.
WICHTIG: Wenn eine spezifische Anfrage die Ergebnisse einschränken könnte, mache sie allgemeiner. \
Wenn eine allgemeine Anfrage zu viele Ergebnisse liefern könnte, mache sie detaillierter.
Wenn es einen klaren Themenwechsel gibt, stelle sicher, dass die Abfrage das neue Thema genau \
widerspiegelt.
Entferne alle Informationen, die für die Internetsuche nicht relevant sind.

{GENERAL_SEP_PAT}
Chatverlauf:
{{chat_history}}
{GENERAL_SEP_PAT}

Folgeanfrage: {{question}}
Internet-Suchanfrage (antworte mit einer detaillierten und spezifischen Anfrage):
""".strip()


# The below prompts are retired
NO_SEARCH = "Keine Suche"
REQUIRE_SEARCH_SYSTEM_MSG = f"""
Du bist ein Large Language Model, dessen einzige Aufgabe es ist, zu bestimmen, ob das System ein \
externes Suchwerkzeug aufrufen soll, um die letzte Nachricht des Benutzers beantworten zu können.

Antworte mit „{NO_SEARCH}“, wenn:
- es gibt genügend Informationen im Chatverlauf, um die Benutzeranfrage vollständig zu beantworten
- es gibt genügend Wissen im LLM, um die Benutzeranfrage vollständig zu beantworten
- die Benutzeranfrage benötigt kein spezifisches Wissen

Antworte mit „{YES_SEARCH}“, wenn:
- zusätzliches Wissen über Entitäten, Prozesse, Probleme oder etwas anderes zu einer besseren Antwort \
führen könnte.
- es besteht eine gewisse Unsicherheit darüber, worauf sich der Benutzer bezieht

Antworte EXAKT und WIRKLICH NUR mit „{YES_SEARCH}“ oder „{NO_SEARCH}“.
"""


REQUIRE_SEARCH_HINT = f"""
Hinweis: Antworte EXAKT mit {YES_SEARCH} oder {NO_SEARCH}.
""".strip()


QUERY_REPHRASE_SYSTEM_MSG = """
Ausgehend von einer Konversation (zwischen Mensch und Assistent) und einer abschließenden Nachricht \
des Menschen, schreibe die letzte Nachricht so um, dass sie eine prägnante, eigenständige Anfrage ist, \
die den erforderlichen/relevanten Kontext aus früheren Nachrichten erfasst. Diese Frage muss für eine \
semantische Suchmaschine (Natural Language Search Engine) nützlich sein.
""".strip()

QUERY_REPHRASE_USER_MSG = """
Hilf mir, diese letzte Nachricht in eine eigenständige Anfrage umzuschreiben, die auch die früheren \
Nachrichten der Konversation berücksichtigt – WENN sie relevant sind. Diese Anfrage wird mit einer \
semantischen Suchmaschine (Natural Language Search Engine) verwendet, um Dokumente abzurufen. Du musst \
NUR die umgeschriebene Anfrage zurückgeben und NICHTS WEITER. \
WICHTIG, die Suchmaschine hat keinen Zugriff auf den Gesprächsverlauf!

Anfrage:
{final_query}
""".strip()


CHAT_NAMING = f"""
Gib für das folgende Gespräch einen KURZEN Namen an.{{language_hint_or_empty}}
WICHTIG: VERSUCHE NICHT MEHR ALS 5 WÖRTER ZU VERWENDEN UND FASSE DICH SICH SO KURZ WIE MÖGLICH.
Fokussiere den Namen auf die wichtigen Schlüsselwörter, um das Thema des Gesprächs zu vermitteln.

Chatverlauf:
{{chat_history}}
{GENERAL_SEP_PAT}

Basierend auf dem Obigen, was ist ein kurzer Name, der das Thema des Gesprächs vermittelt?
""".strip()
