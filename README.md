# IEEE TEDU Website

Website of the IEEE Student Branch at TED University, with an admin panel for managing the team, the blog and contact messages.

Built with Next.js (App Router). Data is in MongoDB, images are in a Backblaze B2 bucket.

The first version of the site was designed and built by [Ömer Harmankaya](https://github.com/OmerHarmankayaC): [OmerHarmankayaC/IEEE-WebSite](https://github.com/OmerHarmankayaC/IEEE-WebSite). This version moves it to Next.js and keeps the original palette, fonts and content.

## Running locally

Needs Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev
```

Open http://localhost:3000.

Other scripts:

- `npm run lint` runs ESLint.
- `npm run check:services` checks that MongoDB and the B2 bucket can be reached (read-only).
- `npm run seed:blog` adds the first five blog posts to an empty database. It is safe to run twice.

## Environment variables

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `B2_S3_ENDPOINT` | S3 endpoint of the bucket, e.g. `https://s3.eu-central-003.backblazeb2.com` |
| `B2_S3_REGION` | Region from that endpoint, e.g. `eu-central-003` |
| `B2_BUCKET_NAME` | Bucket name |
| `B2_APPLICATION_KEY_ID` | Application key ID |
| `B2_APPLICATION_KEY` | Application key |

All are server-only. Do not commit `.env`.

## Project structure

- `app/page.js`: home page, built from `app/components/`.
- `app/blog`: blog list and posts, read from the database.
- `app/contact`: contact form. Messages are saved to the database.
- `app/admin`: admin panel (team, blog, messages, admins).
- `app/media/[...key]`: serves images from the private bucket.
- `app/components/site-interactions.js`: scroll animations, carousels and tabs. It finds elements by `id` or `data-*` attributes because CSS module class names change at build time.
- `lib/`: database, bucket, login and data helpers.

Each component has its own `.module.css`. `app/globals.css` holds colors, fonts and a few shared classes.

## Data

Collections: `people`, `team_years`, `posts`, `messages`, `admins`, `admin_sessions`.

Only years with `published: true` and posts with `published: true` appear on the site. The public pages refresh at most once an hour, and the admin panel refreshes them right after each change.

## Admin panel

Open `/admin`. There are two roles: `chief` can manage other admins, `admin` can manage everything else. Logins last 7 days, and 5 wrong passwords block an IP for about 10 minutes.

To create the chief account:

1. Run `npm run hash-password` and type a password. Copy the printed hash.
2. In the `admins` collection add:
   ```json
   { "username": "chief", "role": "chief", "passwordHash": "scrypt:..." }
   ```
3. Log in at `/admin/login`.

To reset a password, repeat step 1 and replace `passwordHash`.

## Deploying on Vercel

1. Import the repository (Next.js preset).
2. Add the environment variables before the first deploy.
3. In MongoDB Atlas, allow connections from anywhere (`0.0.0.0/0`) under Network Access, because Vercel has no fixed IP.
