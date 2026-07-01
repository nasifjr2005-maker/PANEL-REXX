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
KEYAUTH_HWID=
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

Do not commit real KeyAuth credentials. On Netlify, add the same variables in Site configuration -> Environment variables.

The admin page uses KeyAuth username/password login at `/admin`.
If your KeyAuth app has Force HWID enabled, set `KEYAUTH_HWID` or disable Force HWID in the KeyAuth app settings.

## Storage

Admin edits are saved through `/api/content`.

- On Netlify: saved in Netlify Blobs, so changes survive function/server restarts.
- Locally: saved to `.data/site-content.json`.

## Netlify

The project includes `netlify.toml` and `@netlify/plugin-nextjs`.

Build command:

```bash
npm run build
```

Publish directory:

```bash
.next
```
