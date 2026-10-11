# Formato delle tabelle in JSON

Le tabelle non sono nel repository. Oltre all'incolla di testo nella pagina Dati, si può importare un file JSON
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
