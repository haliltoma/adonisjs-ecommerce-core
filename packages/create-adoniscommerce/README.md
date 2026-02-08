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
  --npm                  Use npm as package manager
  --yarn                 Use yarn as package manager
  --pnpm                 Use pnpm as package manager (default)
  --no-git               Skip git initialization
  --no-install           Skip dependency installation
  --docker               Initialize with Docker setup
  -V, --version          Output the version number
  -h, --help             Display help
```

## Examples

```bash
# Create with Docker support
npx create-adoniscommerce my-store --docker

# Create without git initialization
npx create-adoniscommerce my-store --no-git

# Create using npm instead of pnpm
npx create-adoniscommerce my-store --npm
```

## What's Included

- 🛍️ Full e-commerce storefront
- 🔧 Admin panel for management
- 🗄️ PostgreSQL database with 55+ migrations
- ⚡ Redis for caching and sessions
- 🐳 Docker development environment
- 🧪 E2E tests with Puppeteer

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
