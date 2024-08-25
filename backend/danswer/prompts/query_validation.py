# The following prompts are used for verifying if the user's query can be answered by the current
# system. Many new users do not understand the design/capabilities of the system and will ask
# questions that are unanswerable such as aggregations or user specific questions that the system
# cannot handle, this is used to identify those cases
from danswer.prompts.constants import ANSWERABLE_PAT
from danswer.prompts.constants import GENERAL_SEP_PAT
from danswer.prompts.constants import QUESTION_PAT
from danswer.prompts.constants import THOUGHT_PAT


ANSWERABLE_PROMPT = f"""
Du bist ein Hilfswerkzeug, das feststellt, ob eine Anfrage mithilfe von Retrieval Augmented \
Generation (RAG) beantwortet werden kann.
Das Hauptsystem wird versuchen, die Benutzeranfrage basierend auf NUR 5 der relevantesten \
Dokumente zu beantworten, die bei der Suche gefunden wurden.
Die Quellen enthalten sowohl aktuelle als auch proprietäre Informationen für das jeweilige \
Team.
Gehe bei benannten oder unbekannten Entitäten davon aus, dass die Suche relevantes und \
konsistentes Wissen über die Entität finden wird.
Das System ist nicht auf das Schreiben von Code abgestimmt.
Das System ist nicht darauf ausgelegt, mit strukturierten Daten über Abfragesprachen wie SQL \
zu interagieren.
Wenn für die Frage möglicherweise kein Code oder keine Abfragesprache erforderlich ist, gehe \
davon aus, dass sie ohne Code oder Abfragesprache beantwortet werden kann.
Bestimme, ob das System versuchen sollte, die Frage zu beantworten.
„{ANSWERABLE_PAT.upper()[:-1]}“ muss exakt „Wahr“ oder „Falsch“ sein.

{GENERAL_SEP_PAT}

{QUESTION_PAT.upper()} Worum geht es in diesem Slack-Kanal?
```
{THOUGHT_PAT.upper()} Zunächst muss das System feststellen, auf welchen Slack-Kanal es sich bezieht. \
Durch das Abrufen von 5 Dokumenten, die sich auf den Inhalt von Slack-Kanälen beziehen, ist es nicht \
möglich zu bestimmen, auf welchen Slack-Kanal sich der Benutzer bezieht.
{ANSWERABLE_PAT.upper()} Falsch
```

{QUESTION_PAT.upper()} Danswer ist nicht erreichbar.
```
{THOUGHT_PAT.upper()} Das System sucht nach Dokumenten im Zusammenhang mit der Nichterreichbarkeit \
von Danswer. Angenommen, die Dokumente aus der Suche enthalten Situationen, in denen Danswer nicht \
erreichbar ist, und einen Fix dafür enthält, kann die Anfrage möglicherweise beantwortet werden.
{ANSWERABLE_PAT.upper()} Wahr
```

{QUESTION_PAT.upper()} Wie viele Kunden haben wir?
```
{THOUGHT_PAT.upper()} Unter der Annahme, dass die abgerufenen Dokumente aktuelle Informationen zur \
Kundengewinnung enthalten, einschließlich einer Liste von Kunden, kann die Anfrage beantwortet werden. \
Es ist wichtig zu beachten, dass das System kein SQL ausführen kann und keine Antwort finden wird, \
wenn die Informationen nur in einer SQL-Datenbank vorhanden sind.
{ANSWERABLE_PAT.upper()} Wahr
```

{QUESTION_PAT.upper()} {{user_query}}
""".strip()


# Use the following for easy viewing of prompts
if __name__ == "__main__":
    print(ANSWERABLE_PROMPT)
