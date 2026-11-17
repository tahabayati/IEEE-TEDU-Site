# IEEE TEDU Website

Website of the IEEE Student Branch at TED University, with an admin panel for the team.

Built with Next.js (App Router) and JavaScript. Team data is stored in MongoDB and team photos in a Backblaze B2 bucket.

## Version 1

The first version of this website was designed and built by [Ömer Harmankaya](https://github.com/OmerHarmankayaC):
[OmerHarmankayaC/IEEE-WebSite](https://github.com/OmerHarmankayaC/IEEE-WebSite).
This version moves it to Next.js and keeps the original design.

## Running locally

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Open http://localhost:3000. `npm run check:services` checks that MongoDB and the B2 bucket are reachable with your `.env` values (read-only).

## Environment variables

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `B2_S3_ENDPOINT` | S3 endpoint from the bucket details, e.g. `https://s3.eu-central-003.backblazeb2.com` |
| `B2_S3_REGION` | Region from that endpoint, e.g. `eu-central-003` |
| `B2_BUCKET_NAME` | Bucket name |
| `B2_APPLICATION_KEY_ID` | Application key ID |
| `B2_APPLICATION_KEY` | Application key |

All of them are server-only. Never commit `.env`.

## Project structure

- `app/page.js`: home page, built from the sections in `app/components/`.
- `app/blog`, `app/blog-*`: blog list and posts. Posts use `components/BlogArticle.js`.
- `app/contact`: contact page.
- `app/admin`: admin panel and login.
- `app/media/[...key]`: serves team photos from the private bucket, cached by Vercel's CDN.
- `app/components/site-interactions.js`: scroll animations, carousels and tabs. It finds elements by `id` or `data-*` attributes, because CSS module class names change at build time.
- `lib/`: database, bucket, team data and admin login code.

Each component has its own `.module.css`. `app/globals.css` only has colors, fonts and a few shared classes (`.container`, `.btn`, `.section-title`, `.reveal`).

## Team data

- `people` collection: one document per person (`name`, `linkedin`, `photoKey`).
- `team_years` collection: one document per year, e.g. `2025-2026`, with the board and groups. Only years with `published: true` are shown on the site.

The home page is rebuilt at most once an hour, so database changes can take up to an hour to show.

## Admin panel (`/admin`)

There are two roles, `chief` and `admin`. Only the chief can add, edit and remove admins. Logins last 7 days.

To create the chief account:

1. Run `npm run hash-password` and type the password. Copy the printed `passwordHash`.
2. In MongoDB Compass, add a document to the `admins` collection:
   ```json
   { "username": "chief", "role": "chief", "passwordHash": "scrypt:..." }
   ```
   Usernames are 3-32 characters: letters, digits, `.`, `_`, `-`.
3. Log in at `/admin/login`.

The password itself is never stored. To reset it, repeat step 1 and replace `passwordHash`.

## Deploying on Vercel

1. Import the repository in Vercel (Next.js preset, default settings).
2. Add the environment variables above before the first deploy. The build reads team data from the database.
3. In MongoDB Atlas, allow connections from anywhere (`0.0.0.0/0`) under Network Access, since Vercel has no fixed IP addresses.
