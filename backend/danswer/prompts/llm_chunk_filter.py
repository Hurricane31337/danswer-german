# The following prompts are used to pass each chunk to the LLM (the cheap/fast one)
# to determine if the chunk is useful towards the user query. This is used as part
# of the reranking flow

USEFUL_PAT = "Yes useful"
NONUSEFUL_PAT = "Not useful"
SECTION_FILTER_PROMPT = f"""
Bestimme, ob der folgende Abschnitt für die Beantwortung der Benutzeranfrage \
NÜTZLICH ist.
Es reicht NICHT aus, dass der Abschnitt mit der Anfrage in Verbindung steht – \
er muss Informationen enthalten, die für die Beantwortung der Abfrage NÜTZLICH \
sind.
Wenn der Abschnitt IRGENDEINE nützliche Information enthält, ist das gut genug.
Er muss nicht jeden Teil der Benutzeranfrage vollständig beantworten.


Titel: {{title}}
{{optional_metadata}}
Quellenverzeichnis:
```
{{chunk_text}}
```

Benutzeranfrage:
```
{{user_query}}
```

Antworte EXAKT und WIRKLICH NUR mit „{USEFUL_PAT}“ oder „{NONUSEFUL_PAT}“.
""".strip()


# Use the following for easy viewing of prompts
if __name__ == "__main__":
    print(SECTION_FILTER_PROMPT)
