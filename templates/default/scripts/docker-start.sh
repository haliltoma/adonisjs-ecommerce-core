#!/bin/bash

# AdonisCommerce Docker Start Script
# This script helps manage the Docker environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "AdonisCommerce Docker Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev           Start development environment"
    echo "  dev:tools     Start development with admin tools (Adminer, Redis Commander, MailHog)"
    echo "  prod          Start production environment"
    echo "  stop          Stop all containers"
    echo "  restart       Restart all containers"
    echo "  logs          View application logs"
    echo "  logs:all      View all container logs"
    echo "  shell         Open shell in app container"
    echo "  db:shell      Open PostgreSQL shell"
    echo "  db:migrate    Run database migrations"
    echo "  db:seed       Run database seeders"
    echo "  db:reset      Reset database (drop, create, migrate, seed)"
    echo "  redis:shell   Open Redis CLI"
    echo "  clean         Remove all containers and volumes"
    echo "  status        Show container status"
    echo "  help          Show this help message"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
}

setup_env() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.docker" ]; then
            cp .env.docker .env
            print_info "Created .env from .env.docker"
        else
            print_error ".env file not found. Please create one from .env.docker"
            exit 1
        fi
    fi
}

# Main command handler
case "${1:-help}" in
    dev)
        check_docker
        setup_env
        print_info "Starting development environment..."
        docker compose up -d
        print_success "Development environment started!"
        echo ""
        echo "  App:      http://localhost:3333"
        echo ""
        print_info "Run '$0 logs' to view logs"
        ;;

    dev:tools)
        check_docker
        setup_env
        print_info "Starting development environment with tools..."
        docker compose --profile tools up -d
        print_success "Development environment with tools started!"
        echo ""
        echo "  App:              http://localhost:3333"
        echo "  Adminer (DB):     http://localhost:8080"
        echo "  Redis Commander:  http://localhost:8081"
        echo "  MailHog:          http://localhost:8025"
        echo ""
        ;;

    prod)
        check_docker
        if [ ! -f ".env" ]; then
            print_error "Please create .env file from .env.docker.prod with production values"
            exit 1
        fi
        print_info "Starting production environment..."
        docker compose -f docker-compose.prod.yml up -d --build
        print_success "Production environment started!"
        ;;

    stop)
        check_docker
        print_info "Stopping containers..."
        docker compose down
        docker compose -f docker-compose.prod.yml down 2>/dev/null || true
        print_success "Containers stopped"
        ;;

    restart)
        check_docker
        print_info "Restarting containers..."
        docker compose restart
        print_success "Containers restarted"
        ;;

    logs)
        check_docker
        docker compose logs -f app
        ;;

    logs:all)
        check_docker
        docker compose logs -f
        ;;

    shell)
        check_docker
        print_info "Opening shell in app container..."
        docker compose exec app sh
        ;;

    db:shell)
        check_docker
        print_info "Opening PostgreSQL shell..."
        docker compose exec postgres psql -U postgres -d adoniscommerce
        ;;

    db:migrate)
        check_docker
        print_info "Running migrations..."
        docker compose exec app node ace migration:run
        print_success "Migrations completed"
        ;;

    db:seed)
        check_docker
        print_info "Running seeders..."
        docker compose exec app node ace db:seed
        print_success "Seeding completed"
        ;;

    db:reset)
        check_docker
        print_warning "This will delete all data. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_info "Resetting database..."
            docker compose exec app node ace migration:fresh --seed
            print_success "Database reset completed"
        else
            print_info "Cancelled"
        fi
        ;;

    redis:shell)
        check_docker
        print_info "Opening Redis CLI..."
        docker compose exec redis redis-cli -a redis123
        ;;

    clean)
        check_docker
        print_warning "This will remove all containers, volumes, and data. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_info "Cleaning up..."
            docker compose down -v --remove-orphans
            docker compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
            print_success "Cleanup completed"
        else
            print_info "Cancelled"
        fi
        ;;

    status)
        check_docker
        docker compose ps
        ;;

    help|*)
        show_help
        ;;
esac
