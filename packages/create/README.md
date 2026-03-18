# @adonisjs-ecommerce-core/create

Create a new AdonisCommerce e-commerce application with a single command.

## Usage

```bash
# Using npx (recommended)
npx @adonisjs-ecommerce-core/create my-store

# Using pnpm
pnpm create @adonisjs-ecommerce-core/create my-store

# Using yarn
yarn create @adonisjs-ecommerce-core/create my-store

# Using npm
npm create @adonisjs-ecommerce-core/create my-store
```

## Options

```bash
npx @adonisjs-ecommerce-core/create <project-name> [options]

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
npx @adonisjs-ecommerce-core/create my-store --docker

# Create without git initialization
npx @adonisjs-ecommerce-core/create my-store --no-git

# Create using npm instead of pnpm
npx @adonisjs-ecommerce-core/create my-store --npm
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
