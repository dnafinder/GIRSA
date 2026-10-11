# Formato delle tabelle in JSON

Le tabelle del compendio sono già incluse (`js/tabledata.js`). Questo formato serve per aggiungerne altre. Oltre all'incolla di testo nella pagina Dati, si può importare un file JSON
(anche un array di tabelle). Metti i tuoi file qui come `*.local.json`: sono ignorati da git.

## Tabella di attacco
```json
{
  "type": "attack",
  "name": "Nome arma",
  "armors": ["1", "2", "3"],
  "fumble": 4,
  "rows": [
    { "min": null, "max": 35, "cells": [{ "pf": 0, "crit": null }, { "pf": 0, "crit": null }, { "pf": 0, "crit": null }] },
    { "min": 36, "max": 40, "cells": [{ "pf": 3, "crit": "A" }, { "pf": 1, "crit": null }, { "pf": 0, "crit": null }] }
  ]
}
```
- `armors`: nomi delle colonne; ogni riga ha esattamente tante `cells`.
- `min: null` significa «da meno infinito»; le righe devono essere contigue (`min` = `max` precedente + 1).
- `crit`: `T`, `A`, `B`, `C`, `D`, `E` oppure `null`.
- `fumble`: tiro non modificato massimo che dà fallimento critico (vuoto se non lo vuoi).

## Tabella dei colpi critici
```json
{ "type": "crit", "name": "Taglio", "rows": [{ "min": null, "max": 5, "text": "…" }, { "min": 6, "max": 16, "text": "…" }] }
```

Campi facoltativi delle tabelle di attacco, usati da quelle incluse:
- `limits`: `[{ "label": "Piccoli", "max": 105 }]`, il risultato non supera `max` per il limite scelto;
- `ti`: `[{ "min": 100, "max": 100, "limit": null, "cells": [...] }]`, righe «tiro invariato», valide se il tiro non modificato rientra in `min`–`max`;
- una cella `{ "pf": 0, "crit": null, "fail": true }` indica un fallimento dell'incantesimo («F»).
