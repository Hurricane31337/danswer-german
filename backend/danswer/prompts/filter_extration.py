# The following prompts are used for extracting filters to apply along with the query in the
# document index. For example, a filter for dates or a filter by source type such as GitHub
# or Slack
from danswer.prompts.constants import SOURCES_KEY


# Smaller followup prompts in time_filter.py
TIME_FILTER_PROMPT = """
Du bist ein Werkzeug, um Zeitfilter zu identifizieren, die auf eine Benutzeranfrage für eine \
nachgelagerte Suchanwendung angewendet werden sollen. Die nachgelagerte Anwendung kann eine \
Präferenz für Aktuelles (favors recent) anwenden oder einen harten Stichtag (hard cutoff) \
anwenden, um alle Dokumente vor diesem Zeitpunkt zu entfernen. Identifiziere die richtigen Filter, \
die auf die Benutzeranfrage angewendet werden sollen.

Der aktuelle Tag und die Uhrzeit sind {current_day_time_str}.

Antworte IMMER NUR im JSON-Format, welches die Schlüssel „filter_type“, „filter_value“, \
„value_multiple“ und „date“ enthält.

Die gültigen Werte für „filter_type“ sind  „hard cutoff“, „favors recent“, oder „not time sensitive“.
Die gültigen Werte für „filter_value“ sind „day“ (Tag), „week“ (Woche), „month“ (Monat), „quarter“ \
(Quartal), „half“ (halbes Jahr), oder „year“ (ganzes Jahr).
Der gültige Wert für „value_multiple“ ist irgendeine Zahl.
Der gültige Wert für „date“ ist ein Datum im Format MM/TT/YYYY – befolge IMMER dieses Format.
""".strip()


# Smaller followup prompts in source_filter.py
# Known issue: LLMs like GPT-3.5 try to generalize. If the valid sources contains "web" but not
# "confluence" and the user asks for confluence related things, the LLM will select "web" since
# confluence is accessed as a website. This cannot be fixed without also reducing the capability
# to match things like repository->github, website->web, etc.
# This is generally not a big issue though as if the company has confluence, hopefully they add
# a connector for it or the user is aware that confluence has not been added.
SOURCE_FILTER_PROMPT = f"""
Extrahiere aus einer gegebenen Benutzeranfrage relevante Quellfilter zur Verwendung in einer \
nachgeschalteten Suchanwendung.
Antworte im JSON-Format, das die Quellenfilter oder „null“ (leer) enthält, wenn keine spezifischen \
Quellen referenziert werden.
Extrahiere NUR Quellen, wenn der Benutzer den Bereich, aus dem Informationen kommen können, explizit \
einschränkt.
Der Benutzer könnte ungültige Quellenfilter angeben – ignoriere diese.

Die gültigen Quellen sind:
{{valid_sources}}
{{web_source_warning}}
{{file_source_warning}}


Antworte IMMER NUR im JSON-Format mit dem Schlüssel „{SOURCES_KEY}“. \
Der Wert für „{SOURCES_KEY}“ muss „null“ (leer) oder eine Liste gültiger Quellen sein.

Sample Response:
{{sample_response}}
""".strip()

WEB_SOURCE_WARNING = """
Hinweis: Die Quelle „web“ gilt nur, wenn der Benutzer in der Anfrage „website“ angibt. Sie \
gilt nicht für Tools wie Confluence, GitHub usw., die über eine Website verfügen.
""".strip()

FILE_SOURCE_WARNING = """
Hinweis: Die Quelle „file“ gilt nur, wenn der Benutzer in der Anfrage auf hochgeladene Dateien \
verweist.
""".strip()


# Use the following for easy viewing of prompts
if __name__ == "__main__":
    print(TIME_FILTER_PROMPT)
    print("------------------")
    print(SOURCE_FILTER_PROMPT)
