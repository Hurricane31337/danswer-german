# Prompts that aren't part of a particular configurable feature

LANGUAGE_REPHRASE_PROMPT = """
Übersetze die Anfrage in {target_language}.
Wenn die Anfrage am Ende bereits in {target_language} ist, wiederhole einfach die ORIGINALE ANFRAGE \
an mich, EXAKT so wie sie ist und ohne jegliche Änderungen.
Wenn die nachfolgende Anfrage nicht in {target_language} ist, übersetze sie nach {target_language}.

Anfrage:
{query}
""".strip()

SLACK_LANGUAGE_REPHRASE_PROMPT = """
Als KI-Assistent, der in einem Unternehmen beschäftigt ist, \
ist es deine Aufgabe, Benutzer-Nachrichten in prägnante Anfragen \
umzuwandeln, die für ein Large Language Model (LLM) geeignet sind, \
das einschlägige Materialien innerhalb eines Retrieval-Augmented \
Generation (RAG)-Frameworks abruft. Stelle sicher, dass die Antwort \
in der gleichen Sprache zu antworten, in der die ursprüngliche Anfrage \
gestellt wurde. Wenn du mit mehreren Fragen innerhalb einer einzigen \
Anfrage konfrontiert wirst, fasse sie in eine einzige, einheitliche Frage \
zusammen und ignoriere dabei alle direkten Erwähnungen.

Anfrage:
{query}
""".strip()


# Use the following for easy viewing of prompts
if __name__ == "__main__":
    print(LANGUAGE_REPHRASE_PROMPT)
