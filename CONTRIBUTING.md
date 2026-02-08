# Contributing to AdonisCommerce

Thank you for your interest in contributing to AdonisCommerce! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose (for database)
- Git

### Getting Started

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/adonisjs-ecommerce-core.git
   cd adonisjs-ecommerce-core
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Build the CLI**

   ```bash
   pnpm build:cli
   ```

5. **Start development**

   ```bash
   # Start the template in development mode
   pnpm dev

   # Or with Docker
   cd templates/default
   make docker-dev
   ```

## Project Structure

```
adonisjs-ecommerce-core/
├── packages/
│   └── create-adoniscommerce/  # CLI tool
│       ├── src/
│       │   └── index.ts        # CLI entry point
│       └── package.json
├── templates/
│   └── default/                # Main template
│       ├── app/                # AdonisJS application
│       ├── inertia/            # React frontend
│       └── ...
├── package.json                # Root workspace config
└── pnpm-workspace.yaml         # pnpm workspace config
```

## Making Changes

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Workflow

1. **Create a branch**

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**

   - Follow the existing code style
   - Write meaningful commit messages
   - Add tests for new features
   - Update documentation as needed

3. **Test your changes**

   ```bash
   # Run linting
   pnpm lint

   # Run tests
   pnpm test

   # Run E2E tests
   pnpm test:e2e
   ```

4. **Commit your changes**

   We follow [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add new payment method"
   git commit -m "fix: resolve cart calculation issue"
   git commit -m "docs: update installation guide"
   ```

5. **Push and create a Pull Request**

   ```bash
   git push origin feature/my-new-feature
   ```

   Then create a Pull Request on GitHub.

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use explicit types where helpful
- Avoid `any` type

### React

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and focused
- Use Tailwind CSS for styling

### AdonisJS

- Follow AdonisJS conventions
- Use Lucid ORM for database operations
- Use VineJS for validation
- Use services for business logic

## Testing

### Unit Tests

Located in `tests/unit/`. Run with:

```bash
pnpm test
```

### E2E Tests

Located in `templates/default/tests/e2e/`. Run with:

```bash
cd templates/default
pnpm test:e2e
```

### Writing Tests

- Test the behavior, not the implementation
- Use descriptive test names
- Cover edge cases
- Keep tests isolated

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update inline comments for complex logic
- Create examples for new features

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project style
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Description

Include:
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots (for UI changes)

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, your PR will be merged

## Publishing (Maintainers)

### CLI Package

```bash
# Version bump
pnpm version:patch  # Bug fixes
pnpm version:minor  # New features
pnpm version:major  # Breaking changes

# Publish to npm
pnpm publish:cli
```

### Release Checklist

- [ ] All tests pass
- [ ] CHANGELOG is updated
- [ ] Version is bumped
- [ ] Documentation is current
- [ ] Release notes are written

## Getting Help

- 💬 [GitHub Discussions](https://github.com/haliltoma/adonisjs-ecommerce-core/discussions)
- 🐛 [Issue Tracker](https://github.com/haliltoma/adonisjs-ecommerce-core/issues)

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to build something great together.

---

Thank you for contributing! 🎉
