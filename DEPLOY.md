# Deploy korar guide — Muldhon

Ei project ekhon **ekta Vercel project** hisebe deploy hobe: React app static
file hisebe serve hobe, ar Express API oi same domain-er `/api` te serverless
function hisebe cholbe. Same origin bole browser `/api` relative path e call
kore — `VITE_API_URL` sync korar jhamela nei, CORS-er jhamela nei. Eta-i age
login/register fail korar main karon chilo.

---

## Step 1 — Local e install kore ekbar build kore dekhun

PowerShell / CMD e, `D:\claude\muldhon` folder e:

```bash
npm install
npm run build
```

`client/dist` folder toiri hole build thik ache.

> **Note:** `client/.env` file ta ami likhte parini (security policy). Oita
> nijei khule ei ek line e boshan — local dev e `/api` proxy kaj korar jonno
> eta empty thaka lagbe:
>
> ```
> VITE_API_URL=
> ```

---

## Step 2 — GitHub e push korun

```bash
git add -A
git commit -m "Single-project Vercel deploy, gender radios, verification upload, new logo, instant navigation"
git push origin main
```

Notun je file gulo add hoyeche, egulo push hoyeche kina check korun:
`vercel.json`, `package.json`, `package-lock.json`, `api/index.js`,
`client/public/logo.svg`, `client/src/routes.js`.

```bash
git ls-files vercel.json package.json api/index.js client/public/logo.svg client/src/routes.js
```

Panch ta path-i list e ashle thik ache.

---

## Step 3 — Vercel project settings (ei step ta shob cheye important)

Vercel dashboard → **crm-both-one** project → **Settings**:

### General

| Setting | Value |
| --- | --- |
| **Root Directory** | **khali rakhun (repository root)** — `client` ba `server` NA |
| Framework Preset | **Other** |
| Build Command | default e rakhun (`vercel.json` theke ashbe) |
| Output Directory | default e rakhun (`vercel.json` theke ashbe) |

> Root Directory bhul thakle **shob page e 404** ashe — ekhon jeta hocche.

### Environment Variables (Production **ebong** Preview, duitatei)

| Name | Value |
| --- | --- |
| `MONGO_URI` | apnar Atlas string, `mongodb+srv://...` diye shuru, sheshe `/muldhon` |
| `JWT_SECRET` | lomba random string |

- `VITE_API_URL` **set korben NA**. Already set thakle **delete korun** — eta
  set thakle client nijer domain er bodole onno jaygay login pathabe.
- `CLIENT_URL` lagbe na (same origin, tai CORS-i ashe na).

> Environment variable add korar por **notun deploy** lagbe — purono build e
> oita dhukbe na.

---

## Step 4 — MongoDB Atlas e IP khule din

Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere
(`0.0.0.0/0`)**.

Vercel function er kono fixed IP nei, tai eta na korle protita request timeout
hobe ar protita login fail korbe.

---

## Step 5 — Redeploy

Vercel → **Deployments** → shob cheye upore-r deployment → `...` menu →
**Redeploy** → **"Use existing Build Cache" uncheck korun** → Redeploy.

---

## Step 6 — Check korun

| URL | Ja ashar kotha |
| --- | --- |
| `https://crm-both-one.vercel.app/` | login screen (404 na) |
| `https://crm-both-one.vercel.app/dashboard` | app (refresh diyeo 404 hobe na) |
| `https://crm-both-one.vercel.app/api/health` | `{"success":true,"service":"Muldhon API",...}` |
| `https://crm-both-one.vercel.app/api/health/db` | `{"success":true,"connected":true,...}` |

**`/api/health/db` — problem khujar shob cheye druto rasta.** `/api/health`
shudhu bole server jegeche; ei ta bole database dhora jacche kina, ar na gele
thik kon karone — `MONGO_URI` nei, localhost e point korche, naki Atlas connect
korte dicche na. Kichu bhul hole agey ei URL ta kholen.

---

## Kichu bhul hole

**Shob page e 404, `/` shoho** — Root Directory repository root e nei, othoba
root `vercel.json` push hoyni.

**`/` kaj kore kintu `/dashboard` refresh e 404** — SPA rewrite missing. Root
`vercel.json` deploy hoyeche kina check korun.

**Login / Register fail kore** — `/api/health/db` kholen:

1. `MONGO_URI is not set` → Settings → Environment Variables e add kore
   redeploy korun.
2. Atlas timeout → Step 4 (Network Access `0.0.0.0/0`) kora hoyni.
3. Authentication failed → `MONGO_URI` er user/password bhul. Password e
   `@ : / ? #` thakle URL-encode korte hobe.

**Build fail kore** — Vercel er build log e `npm install` er error dekhen.
Local e `npm install && npm run build` kaj korle Vercel eo kora uchit, karon
`package-lock.json` duijaygatei ek.
