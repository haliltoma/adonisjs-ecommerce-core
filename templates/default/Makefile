# AdonisCommerce Makefile
# Convenience commands for development and deployment

.PHONY: help install dev build start test clean docker-* db-*

# Default target
help:
	@echo "AdonisCommerce - Available Commands"
	@echo ""
	@echo "Development (Local):"
	@echo "  make install       Install dependencies"
	@echo "  make dev           Start development server"
	@echo "  make build         Build for production"
	@echo "  make start         Start production server"
	@echo "  make test          Run tests"
	@echo "  make test-e2e      Run E2E tests"
	@echo "  make lint          Run linter"
	@echo "  make format        Format code"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev      Start development with Docker"
	@echo "  make docker-dev-tools Start with Adminer, Redis Commander, MailHog"
	@echo "  make docker-prod     Start production with Docker"
	@echo "  make docker-stop     Stop all containers"
	@echo "  make docker-logs     View application logs"
	@echo "  make docker-shell    Open shell in app container"
	@echo "  make docker-clean    Remove all containers and volumes"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate    Run migrations"
	@echo "  make db-seed       Seed database"
	@echo "  make db-reset      Reset database (fresh + seed)"
	@echo "  make db-shell      Open PostgreSQL shell"
	@echo ""

# ============================================
# Local Development
# ============================================

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

test:
	pnpm test

test-e2e:
	pnpm test:e2e

test-e2e-headed:
	pnpm test:e2e:headed

lint:
	pnpm lint

format:
	pnpm format

typecheck:
	pnpm typecheck

# ============================================
# Docker Commands
# ============================================

docker-dev:
	./scripts/docker-start.sh dev

docker-dev-tools:
	./scripts/docker-start.sh dev:tools

docker-prod:
	./scripts/docker-start.sh prod

docker-stop:
	./scripts/docker-start.sh stop

docker-restart:
	./scripts/docker-start.sh restart

docker-logs:
	./scripts/docker-start.sh logs

docker-logs-all:
	./scripts/docker-start.sh logs:all

docker-shell:
	./scripts/docker-start.sh shell

docker-status:
	./scripts/docker-start.sh status

docker-clean:
	./scripts/docker-start.sh clean

# ============================================
# Database Commands
# ============================================

db-migrate:
	node ace migration:run

db-migrate-rollback:
	node ace migration:rollback

db-seed:
	node ace db:seed

db-reset:
	node ace migration:fresh --seed

db-shell:
	./scripts/docker-start.sh db:shell

# Docker database commands
docker-db-migrate:
	./scripts/docker-start.sh db:migrate

docker-db-seed:
	./scripts/docker-start.sh db:seed

docker-db-reset:
	./scripts/docker-start.sh db:reset

# ============================================
# Redis Commands
# ============================================

redis-shell:
	./scripts/docker-start.sh redis:shell

# ============================================
# Utility Commands
# ============================================

# Generate a new app key
generate-key:
	node ace generate:key

# Clear all caches
cache-clear:
	node ace cache:clear

# Create a new migration
migration-make:
	@read -p "Migration name: " name; \
	node ace make:migration $$name

# Create a new model
model-make:
	@read -p "Model name: " name; \
	node ace make:model $$name

# Create a new controller
controller-make:
	@read -p "Controller name: " name; \
	node ace make:controller $$name

# Setup project from scratch
setup: install
	cp .env.docker .env
	@echo "Project setup complete! Run 'make docker-dev' to start."

# Full reset (for development)
reset: docker-clean docker-dev docker-db-reset
	@echo "Full reset complete!"
