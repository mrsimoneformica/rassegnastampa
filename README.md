# Serie A Press Intelligence

Dashboard statica dimostrativa per aggregare e consultare intelligence editoriale sui club di Serie A. Il progetto usa solo HTML, CSS e JavaScript vanilla: non richiede build, dipendenze, API key o framework.

> Tutti i contenuti, punteggi, infortuni, fonti e segnali presenti nell'interfaccia sono dati demo simulati e non rappresentano informazioni aggiornate o ufficiali.

## Aggiornamento automatico giornaliero

Il repository include `.github/workflows/daily-update.yml`. Dopo il caricamento su GitHub, il workflow viene eseguito ogni giorno e può essere lanciato manualmente dalla scheda **Actions**.

Il workflow aggiorna `data/latest.json` usando esclusivamente i feed autorizzati abilitati in `config/sources.json`. All'avvio nessun feed è abilitato: la dashboard continua quindi a usare i dati demo. Inserisci URL RSS/API per cui possiedi il diritto d'uso e imposta `enabled` su `true`.

GitHub pianifica i workflow in UTC e non garantisce l'esecuzione al minuto esatto. Il cron incluso parte alle 05:00 UTC, equivalente alle 06:00 in Italia durante l'ora solare e alle 07:00 durante quella legale. Per un orario locale esatto tutto l'anno è necessario un servizio scheduler che supporti il fuso `Europe/Rome`.

L'adapter Fantacalcio è intenzionalmente disabilitato: deve essere collegato soltanto tramite API, feed o autorizzazione del titolare. Il progetto non aggira paywall, login, CAPTCHA o limitazioni tecniche.

## Avvio locale

Puoi aprire direttamente `index.html` nel browser. Per un comportamento identico a GitHub Pages, avvia un piccolo server statico nella cartella del progetto, per esempio:

```bash
python3 -m http.server 8080
```

Poi visita `http://localhost:8080`.

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository su GitHub.
2. Carica nella radice del repository `index.html`, `style.css`, `app.js` e questo `README.md`.
3. Apri **Settings → Pages**.
4. In **Build and deployment**, scegli **Deploy from a branch**.
5. Seleziona il branch `main`, cartella `/ (root)`, quindi salva.
6. Dopo pochi minuti GitHub mostrerà l'indirizzo pubblico del sito.

I riferimenti agli asset sono relativi, quindi il sito funziona anche quando è pubblicato sotto il percorso di un repository (`username.github.io/nome-repository`).

## Funzioni incluse

- navigazione SPA-like basata su hash;
- dashboard Home e Morning Brief;
- elenco dei 20 club e dossier club;
- feed filtrabile per affidabilità, tema e intervallo temporale;
- Match Intelligence, Injuries e Probable XI su campo grafico;
- Players e Watchlist persistente tramite `localStorage`;
- Sources, Archive e Source Consensus;
- ricerca globale con scorciatoia `Cmd/Ctrl + K`;
- dark/light mode persistente;
- modali, menu mobile e notifiche;
- layout responsive per desktop, tablet e smartphone.

## Collegare fonti reali in futuro

In fondo a `app.js` è disponibile il contratto `PressIntelligenceAdapters`. `DemoAdapter` espone i dati locali; `LiveApiAdapter` è un placeholder. Per produzione è consigliato collegare il frontend a un backend proprietario che:

- custodisca API key e credenziali fuori dal browser;
- interroghi solo API, feed RSS o fonti per cui si dispone dell'autorizzazione;
- normalizzi campi come club, affidabilità, timestamp e relevance score;
- applichi deduplicazione, logging, rate limiting e revisione editoriale.

Non inserire segreti o API key direttamente in `app.js`.

## Struttura

```text
serie-a-press-intelligence/
├── index.html
├── style.css
├── app.js
├── config/sources.json
├── data/latest.json
├── scripts/update-data.mjs
├── .github/workflows/daily-update.yml
└── README.md
```

## Licenza

Codice demo riutilizzabile. Loghi e marchi dei club non sono inclusi; le sigle testuali nell'interfaccia sono segnaposto grafici.
