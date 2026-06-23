# 🎣 Fiskeodds – København

En lille gratis app, der hver dag henter vejrdata og beregner **procentvise odds** for hvilke
fisk der har de bedste forhold i din næste fiskelomme – så du kan planlægge destination og grej.

- **Arter:** hornfisk, sild, makrel, torsk, havørred, aborre, gedde
- **Lokationer:** Amager kyst, Kastrup moler, Sydhavnen (brak), Damhussøen, Bagsværd Sø
- **Tidslommer:** hverdag kl. 18–22, weekend kl. 12–20
- **Vejrdata:** [Open-Meteo](https://open-meteo.com) – helt gratis, ingen API-nøgle
- **Pris i drift:** 0 kr. Alt kører i din browser; ingen server.

---

## Sådan virker det

1. Appen henter time-for-time prognose (temp, lufttryk, vind, skydække, sigt, nedbør) +
   marine data (bølger, vandtemperatur) for hver lokation 7 dage frem.
2. For hver dag tages den relevante tidslomme (hverdag/weekend).
3. Hver art scores ud fra **sæson × lokationstype × tidspunkt/lys × vejr** → en odds-% (0–100).
4. Du ser en rangeret liste pr. dag og kan folde hver art ud for at se vejret og delscorerne.

Al artsviden ligger i [`js/species.js`](js/species.js) og lokationer i [`js/config.js`](js/config.js)
– begge er nemme at justere.

---

## Kør lokalt på PC (test)

ES-moduler kræver en webserver (ikke `file://`). Nemmest:

```bash
cd Fiskenotifikationer
python -m http.server 8000
# åbn http://localhost:8000
```

(eller `npx serve` hvis du har Node.)

---

## Læg den på din iPhone (gratis, uden App Store)

Vi hoster appen gratis på **GitHub Pages** og "installerer" den via Safari som en PWA.

### 1. Lav en gratis GitHub-konto
Gå til [github.com](https://github.com) og opret en konto (gratis).

### 2. Lav et repository og upload filerne
- Klik **New repository** → navngiv fx `fiskeodds` → **Create**.
- Vælg **uploading an existing file** og træk **hele indholdet** af denne mappe ind
  (`index.html`, `styles.css`, `manifest.webmanifest`, `sw.js`, `js/`-mappen, `icons/`-mappen).
- **Commit changes**.

> Vil du hellere bruge kommandolinjen:
> ```bash
> cd Fiskenotifikationer
> git init && git add . && git commit -m "Fiskeodds"
> git branch -M main
> git remote add origin https://github.com/<dit-brugernavn>/fiskeodds.git
> git push -u origin main
> ```

### 3. Slå GitHub Pages til
- I repo'et: **Settings → Pages**.
- Under **Build and deployment → Source** vælg **Deploy from a branch**.
- Vælg branch **main** og mappe **/ (root)** → **Save**.
- Efter ~1 minut får du en URL: `https://<dit-brugernavn>.github.io/fiskeodds/`

### 4. Føj til hjemmeskærm på iPhone
- Åbn URL'en i **Safari** (skal være Safari, ikke Chrome).
- Tryk **Del-ikonet** (firkant med pil op).
- Vælg **Føj til hjemmeskærm** → **Tilføj**.
- Nu ligger "Fiskeodds" som et app-ikon. Den virker også offline (viser sidst hentede data).

✅ Ingen 7-dages udløb, ingen Apple Developer-konto, gratis for altid.

---

## Daglige notifikationer (valgfri udvidelse)

Version 1 er "åbn app → se odds". Vil du have en **automatisk daglig notifikation**
(fx hver aften kl. 19 med morgendagens bedste bud), kræver det et lille gratis ekstra lag:

- **GitHub Actions** (gratis cron-job) der kører fx kl. 19 hver dag, beregner odds og
  sender en **Web Push**-notifikation.
- iOS understøtter web-push for PWA'er der er føjet til hjemmeskærmen (iOS 16.4+).

Det er bygget oven på det nuværende uden ekstra omkostninger. Sig til, så sætter vi det op.

---

## Juster modellen

- **Tilføj/ret en fiskeplads:** rediger `LOCATIONS` i [`js/config.js`](js/config.js).
- **Ret en arts sæson/vejrpræferencer:** rediger `SPECIES` i [`js/species.js`](js/species.js).
- **Ret tidslommer:** rediger `POCKETS` i [`js/config.js`](js/config.js).

Efter ændringer: upload igen til GitHub (eller `git push`). På iPhone hentes ny version
næste gang appen åbnes med netforbindelse.

---

## Filoversigt

```
index.html              App-skal + PWA-metadata
styles.css              Design (mørkt "ocean"-tema)
manifest.webmanifest    PWA-manifest
sw.js                   Service worker (offline)
icons/                  App-ikoner
js/
  config.js             Lokationer + tidslommer
  species.js            Artsviden (sæson, vejr, lys ...)
  weather.js            Henter Open-Meteo (forecast + marine)
  scoring.js            Scoringsmotor → odds-%
  app.js                UI-styring
```
