# CEUTA // SITUATION MONITOR

Monitor de situación de Ceuta en tiempo real. Dashboard estilo SOC con mapa, nivel de amenaza 1-10, feed agrupado por historia, gráfica de evolución de severidad y filtros.

**URLs públicas:**
- https://ceuta-monitor.vercel.app (principal — auto-deploy en cada push del watchdog)
- https://pilshub.github.io/ceuta-monitor (GitHub Pages)

## Cómo funciona

- Un watchdog local (cron de Hermes, cada 30 min) recolecta los RSS de **6 sensores**, clasifica cada noticia con severidad **1–10** (heurística por keywords con anti-falsos-positivos deportivos), deduplica y genera `feed.json` + `historial.json`, que sube automáticamente a este repo (`main`).
- Vercel y GitHub Pages sirven el dashboard; el navegador lee `feed.json` (network-first con Service Worker, offline incluido).
- El watchdog también avisa por Telegram de las noticias ≥ severidad 6.

## Sensores

| Sensor | Feed |
|---|---|
| El Faro de Ceuta | https://elfarodeceuta.es/feed/ |
| Ceuta Actualidad | https://www.ceutaactualidad.com/rss |
| Ceuta TV | https://ceutatv.com/feed/ |
| RTVCE | https://www.rtvce.es/rss |
| Europa Press Ceuta | https://www.europapress.es/rss/ceuta/ |
| Google News (Ceuta) | https://news.google.com/rss/search?q=Ceuta&hl=es&gl=ES&ceid=ES:es |

## API pública (JSON, CORS abierto)

- **`/feed.json`** — últimos eventos (ventana 24 h, top 60 por severidad).
  ```json
  { "updated": "2026-08-15T20:06:03+00:00",
    "sources": ["El Faro de Ceuta", "..."],
    "events": [ { "title": "...", "link": "...", "src": "El Faro de Ceuta",
                  "ts": 1786815106, "sev": 9, "cat": "SUCESO", "zone": null } ] }
  ```
- **`/historial.json`** — eventos acumulados por día (21 días, para gráficas).
  ```json
  { "days": { "2026-08-15": [ { "title": "...", "sev": 9, ... } ] } }
  ```

`ts` está en epoch **segundos**. `sev`: 1–10. `cat`: FRONTERA / MIGRACIÓN · SUCESO · POLÍTICA · NARCOTRÁFICO · DEPORTES · LOCAL.

## Escala de severidad

| Nivel | Color | Ejemplos |
|---|---|---|
| 9–10 | 🚨 rojo | muertes, violaciones, asesinato, tiroteo, avalancha en la valla, naufragio |
| 7–8 | 🟠 naranja | pateras, interceptaciones, detenciones, narcotráfico, incidentes frontera |
| 5–6 | 🟡 amarillo | política, sanidad, presupuestos, obras |
| 1–4 | 🟢 verde | cultura, deportes, rutina |

## Local

```bash
python -m http.server 8124
# abrir http://127.0.0.1:8124
```
