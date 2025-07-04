# Side Project Saturday

A web application for managing weekly side project meetups in Brooklyn, NY. Built with Astro SSR on Cloudflare Workers edge runtime.

## About

Side Project Saturday is a weekly Saturday morning meetup (9am-12pm) where builders, creators, and dreamers gather in Brooklyn to work on their side projects. This application handles event registration, user authentication, and communication for the community.

## Tech Stack

- **Framework**: Astro v5 with SSR enabled for Cloudflare Workers
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Auth**: better-auth with magic link authentication (passwordless)
- **Database**: SQLite via Cloudflare D1 with Prisma ORM
- **Email**: Resend API for sending magic links and event invites
- **Deployment**: Alchemy deployment system on Cloudflare

## Getting Started

This project uses [mise](https://mise.jdx.dev/) for task management and tooling. All commands should be run using mise tasks.

### Prerequisites

1. Install [mise](https://mise.jdx.dev/getting-started.html)
2. Clone this repository
3. Run `mise install` to install required tools

### Environment Variables

Create a `.env` file with:

```
RESEND_API_KEY=your_resend_api_key
AUTH_SECRET=your_auth_secret
BETTER_AUTH_BASE_URL=http://localhost:4433  # for development
PROD_URL=https://your-production-url.com    # for production
```

### Development Commands

| Command | Description |
|---------|-------------|
| `mise dev` | Start development server at `localhost:4433` |
| `mise build` | Build for production |
| `mise preview` | Preview production build locally |
| `mise fmt` | Format code with Biome |
| `mise emails` | Preview email templates |

### Database Commands

| Command | Description |
|---------|-------------|
| `mise migrate:create name="your_migration"` | Create new database migration |
| `mise migrate:dev` | Apply migrations to local database |
| `mise migrate:prod` | Apply migrations to production database |
| `mise gen:better-auth` | Generate better-auth types |

### Deployment Commands

| Command | Description |
|---------|-------------|
| `mise deploy` | Deploy to Cloudflare |
| `mise destroy` | Destroy Cloudflare resources |
| `mise logs` | View production logs |
| `mise open:deployment` | Open Cloudflare dashboard |

## Project Structure

```
/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/
│   ├── actions/           # Server-side form handlers
│   ├── emails/            # React Email templates
│   ├── lib/               # Utilities and configuration
│   ├── pages/             # Astro pages and API routes
│   └── middleware.ts      # Authentication middleware
├── alchemy.run.ts         # Deployment configuration
└── mise.toml             # Task runner configuration
```

## Contributing

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Format code: `mise fmt`
4. Test locally: `mise dev`
5. Commit your changes
6. Push and create a pull request

### Database Changes

1. Update `prisma/schema.prisma`
2. Create migration: `mise migrate:create name="describe_your_change"`
3. Apply locally: `mise migrate:dev`
4. Test your changes
5. Commit both schema and migration files

### Email Template Development

1. Edit templates in `src/emails/`
2. Preview changes: `mise emails`
3. Test with real email: use the magic link flow in development

### Authentication

The app uses passwordless authentication via magic links:
- Users enter their email
- Magic link is sent via Resend
- Clicking the link signs them in
- New users are automatically registered

### Deployment

Deployment is handled by Alchemy and targets Cloudflare:
- `mise deploy` deploys the current code
- Database migrations must be run separately: `mise migrate:prod`
- Environment variables are managed in Cloudflare dashboard

## Architecture Notes

- **Edge-First**: Everything runs on Cloudflare Workers
- **SSR**: All pages are server-side rendered
- **Magic Links Only**: No passwords, just email-based authentication
- **D1 Database**: SQLite database running on Cloudflare's edge
- **Email Integration**: Resend handles all email delivery

## Need Help?

- Check the [CLAUDE.md](./CLAUDE.md) file for detailed project guidance
- Review the mise tasks: `mise tasks`
- Check Astro docs: [astro.build](https://astro.build)
- Review better-auth docs: [better-auth.com](https://better-auth.com)