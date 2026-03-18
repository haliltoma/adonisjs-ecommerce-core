# create-adoniscommerce

Create a new AdonisCommerce e-commerce application with a single command.

## Usage

```bash
# Using npx (recommended)
npx create-adoniscommerce my-store

# Using pnpm
pnpm create adoniscommerce my-store

# Using yarn
yarn create adoniscommerce my-store

# Using npm
npm create adoniscommerce my-store
```

## Options

```bash
npx create-adoniscommerce <project-name> [options]

Options:
  -t, --template <name>  Template to use (default: "default")
  --pm <manager>        Package manager (pnpm, npm, yarn, bun)
  --db <type>           Database type (postgres, mysql, sqlite)
  --docker              Include Docker setup (default: true)
  --git                 Initialize git repository (default: true)
  --install             Install dependencies (default: true)
  -y, --yes             Non-interactive mode with defaults
  --dry-run             Preview without executing
  -v, --verbose         Verbose output
  --offline             Use cached template
  -V, --version         Output the version number
  -h, --help            Display help
```

## Examples

```bash
# Create with Docker support (default)
npx create-adoniscommerce my-store

# Create without Docker
npx create-adoniscommerce my-store --docker=false

# Create without git initialization
npx create-adoniscommerce my-store --git=false

# Create using npm instead of pnpm
npx create-adoniscommerce my-store --pm npm

# Non-interactive mode (use all defaults)
npx create-adoniscommerce my-store --yes
```

## What's Included

- Full e-commerce storefront (React + Inertia)
- Admin panel for store management
- AdonisJS 7 backend with SOLID architecture
- PostgreSQL database with 55+ migrations
- Redis for caching and sessions
- Docker development environment
- TypeScript throughout

## After Creation

```bash
cd my-store

# With Docker (recommended)
make docker-dev
make docker-db-reset

# Without Docker
pnpm dev
```

Visit:
- **App:** http://localhost:3333
- **Admin:** http://localhost:3333/admin (admin@example.com / admin123)

## Documentation

Full documentation: https://github.com/haliltoma/adonisjs-ecommerce-core

## License

MIT