# Nasif / Panel Rexx Portfolio

Futuristic Next.js portfolio with an admin control room.

## Local Development

```bash
npm install
npm run dev
```

Open:

- Public site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## KeyAuth Admin

Create a local `.env.local` from `.env.example`:

```bash
KEYAUTH_NAME=
KEYAUTH_OWNER_ID=
KEYAUTH_SECRET=
KEYAUTH_VERSION=1.0
# Optional. Leave blank to let the app generate a stable web-admin HWID.
KEYAUTH_HWID=
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

Do not commit real KeyAuth credentials. On Netlify, add the same variables in Site configuration -> Environment variables.
Use only the variable name in the Netlify key field, for example `KEYAUTH_NAME`, and put only the value in the value field. Do not paste the full `KEYAUTH_NAME=...` line into one field.
Make sure the variables are available to Functions/runtime, then trigger a fresh deploy after saving them.

The admin page uses KeyAuth username/password login at `/admin`.
If your KeyAuth app has Force HWID enabled, the API now sends a stable generated web-admin HWID when `KEYAUTH_HWID` is blank. Set `KEYAUTH_HWID` only if you want to force a specific value.

## Storage

Admin edits are saved through `/api/content`.

- On Netlify: saved in Netlify Blobs, so changes survive function/server restarts.
- Locally: saved to `.data/site-content.json`.

## Netlify

The project includes `netlify.toml` and `@netlify/plugin-nextjs`.

Required Netlify environment variables:

```bash
KEYAUTH_NAME=your-keyauth-app-name
KEYAUTH_OWNER_ID=your-keyauth-owner-id
KEYAUTH_SECRET=your-keyauth-secret
KEYAUTH_VERSION=1.0
KEYAUTH_HWID=
ADMIN_SESSION_SECRET=replace-with-a-real-long-random-secret
```

Build command:

```bash
npm run build
```

Publish directory:

```bash
.next
```
