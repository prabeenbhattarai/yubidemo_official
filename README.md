# Yubi Demolition — Company Website + Admin Panel

A modern, responsive marketing site for Yubi Demolition, built with **Next.js 16**
(App Router), **TypeScript**, **Tailwind CSS v4**, and a built-in **admin panel**
backed by **Firebase** (Firestore + Storage).

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000  (public site)
                 # http://localhost:3000/api/admin/yubidemo  (admin panel)
```

The site works immediately using built-in default content. Connecting Firebase
(below) unlocks editing and photo uploads.

---

## Admin panel

- **URL:** `/api/admin/yubidemo` → redirects to `/api/admin/yubidemo/login`
- **Password:** set by `ADMIN_PASSWORD` in `.env.local` (defaults to `admin`)
- **What you can control:** company/contact details, all homepage text + images,
  services (add/edit/delete + image), projects, FAQs, and the photo gallery.
- Every section has a **photo upload** where relevant (hero, why-us, sustainability,
  each service, each project, and the gallery).

Until Firebase is connected, the admin shows the built-in content and displays a
"Firebase not connected" banner — **saving and uploads require Firebase.**

---

## Connect Firebase (enables editing + uploads)

Firebase is free for this scale and works on Vercel/Netlify (unlike a local
database). You create the project once and paste the keys in.

1. **Create a project** at <https://console.firebase.google.com> → *Add project*.
2. **Enable Firestore:** Build → Firestore Database → *Create database* (Production mode).
3. **Enable Storage:** Build → Storage → *Get started*. Note the bucket name
   (looks like `your-project-id.appspot.com`).
4. **Get a service account key:** Project settings (gear) → *Service accounts* →
   *Generate new private key*. This downloads a JSON file.
5. **Create `.env.local`** in the project root (copy from `.env.example`) and fill in:

   ```bash
   ADMIN_PASSWORD=your-strong-password
   ADMIN_SESSION_SECRET=some-long-random-string

   FIREBASE_PROJECT_ID=...            # "project_id" from the JSON
   FIREBASE_CLIENT_EMAIL=...          # "client_email" from the JSON
   FIREBASE_PRIVATE_KEY="..."         # "private_key" from the JSON, keep the quotes and \n
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

6. **Seed the initial content** (pushes the current default content into Firestore):

   ```bash
   npm run seed
   ```

7. **Restart** `npm run dev`. The admin banner disappears and saving/uploads work.

### Firestore structure (created for you by the seed + admin)

| Collection / doc         | Holds                                  |
| ------------------------ | -------------------------------------- |
| `singletons/company`     | Contact + company details              |
| `singletons/home`        | All homepage text + section images     |
| `services/*`             | One doc per service                    |
| `projects/*`             | One doc per project                    |
| `faqs/*`                 | One doc per FAQ                        |
| `gallery/*`              | One doc per uploaded photo             |

Uploaded images go to **Firebase Storage** and are served via public URLs.

---

## Deploying to Vercel / Netlify

1. Push to GitHub and import the repo.
2. Add all the `.env.local` variables as **environment variables** in the host's
   dashboard (for `FIREBASE_PRIVATE_KEY`, paste the value including the `\n`).
3. Deploy. Firestore + Storage are cloud services, so they work the same in
   production as locally — no extra database to host.

---

## Where things live

| Area                       | Path                                     |
| -------------------------- | ---------------------------------------- |
| Public pages               | `src/app/(site)/`                        |
| Admin panel                | `src/app/api/admin/yubidemo/`            |
| Content types + defaults   | `src/lib/content-types.ts`               |
| Firestore read/write layer | `src/lib/content.ts`                     |
| Firebase Admin init        | `src/lib/firebase-admin.ts`              |
| Image uploads              | `src/lib/storage.ts` + `/api/admin/upload` |
| Admin auth                 | `src/lib/auth.ts` + `src/proxy.ts`       |
| Brand colours / buttons    | `src/app/globals.css`                    |

## Security notes

- Change `ADMIN_PASSWORD` and set a long random `ADMIN_SESSION_SECRET` before going live.
- `.env.local` is gitignored — never commit real keys.
- The service-account key is server-only; it is never exposed to the browser.

---
Designed by Prabin Bhattarai.
