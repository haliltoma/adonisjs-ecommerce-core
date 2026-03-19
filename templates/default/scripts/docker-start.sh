#!/bin/bash

# AdonisCommerce Docker Management Script
# Supports both Docker services and local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

get_project_name() {
    basename "$PROJECT_DIR" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g'
}

generate_app_key() {
    openssl rand -base64 32 2>/dev/null || head -c 32 | base64
}

get_port_offset() {
    # Fixed port offset - use same ports for all projects to avoid confusion
    # For multiple projects, use docker:dev command with custom ports or edit .env
    echo 0
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
}

setup_env() {
    local project_name=$(get_project_name)
    local port_offset=$(get_port_offset $project_name)

    # Create .env from template if not exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.docker" ]; then
            cp .env.docker .env
        else
            print_error ".env.docker not found"
            exit 1
        fi
    fi

    # Get APP_MODE - always use docker mode when running docker:dev
    local app_mode="docker"

    # Update COMPOSE_PROJECT_NAME
    if ! grep -q "^COMPOSE_PROJECT_NAME=" .env 2>/dev/null; then
        echo "COMPOSE_PROJECT_NAME=$project_name" >> .env
    else
        sed -i "s|^COMPOSE_PROJECT_NAME=.*|COMPOSE_PROJECT_NAME=$project_name|" .env
    fi

    # Update APP_MODE to docker
    if ! grep -q "^APP_MODE=" .env 2>/dev/null; then
        echo "APP_MODE=docker" >> .env
    else
        sed -i "s|^APP_MODE=.*|APP_MODE=docker|" .env
    fi

    # Update PROJECT_NAME
    if ! grep -q "^PROJECT_NAME=" .env 2>/dev/null; then
        echo "PROJECT_NAME=$project_name" >> .env
    fi

    # Generate APP_KEY if empty
    if grep -q "^APP_KEY=$" .env 2>/dev/null || ! grep -q "^APP_KEY=" .env 2>/dev/null; then
        local app_key=$(generate_app_key)
        sed -i "s|^APP_KEY=.*|APP_KEY=$app_key|" .env 2>/dev/null || echo "APP_KEY=$app_key" >> .env
    fi

    # Set DB_DATABASE based on project name
    local current_db=$(grep "^DB_DATABASE=" .env 2>/dev/null | cut -d= -f2)
    if [ -z "$current_db" ]; then
        sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${project_name}_db|" .env 2>/dev/null || echo "DB_DATABASE=${project_name}_db" >> .env
    fi

    # Calculate and set ports
    local db_port=$((5433 + port_offset))
    local redis_port=$((6380 + port_offset))

    # Update ports in .env (add if not exists)
    if grep -q "^DB_PORT=" .env 2>/dev/null; then
        sed -i "s|^DB_PORT=.*|DB_PORT=$db_port|" .env 2>/dev/null
    else
        echo "DB_PORT=$db_port" >> .env
    fi

    if grep -q "^REDIS_PORT=" .env 2>/dev/null; then
        sed -i "s|^REDIS_PORT=.*|REDIS_PORT=$redis_port|" .env 2>/dev/null
    else
        echo "REDIS_PORT=$redis_port" >> .env
    fi

    # Set host configuration based on APP_MODE
    if [ "$app_mode" = "docker" ]; then
        sed -i "s|^DB_HOST=.*|DB_HOST=postgres|" .env 2>/dev/null
        sed -i "s|^REDIS_HOST=.*|REDIS_HOST=redis|" .env 2>/dev/null
    else
        sed -i "s|^DB_HOST=.*|DB_HOST=127.0.0.1|" .env 2>/dev/null
        sed -i "s|^REDIS_HOST=.*|REDIS_HOST=127.0.0.1|" .env 2>/dev/null
    fi

    echo ""
    echo -e "${CYAN}=== Project: $project_name ===${NC}"
    echo -e "  ${CYAN}Mode:${NC} $app_mode"
    echo -e "  ${CYAN}App Port:${NC} http://localhost:3333"
    if [ "$app_mode" = "docker" ]; then
        echo -e "  ${CYAN}DB Port:${NC} $db_port (postgres)"
        echo -e "  ${CYAN}Redis Port:${NC} $redis_port"
    else
        echo -e "  ${CYAN}DB:${NC} 127.0.0.1:5432 (local)"
        echo -e "  ${CYAN}Redis:${NC} 127.0.0.1:6379 (local)"
    fi
    echo ""
}

show_help() {
    echo "AdonisCommerce Docker Management"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev           Start Docker services (postgres + redis)"
    echo "  dev:local     Start in local mode (no Docker services)"
    echo "  stop          Stop Docker services"
    echo "  restart       Restart Docker services"
    echo "  status        Show service status"
    echo "  logs          View application logs"
    echo "  db:shell      Open PostgreSQL shell"
    echo "  redis:shell   Open Redis CLI"
    echo "  clean         Remove containers and volumes"
    echo "  mode          Show current mode (docker/local)"
    echo "  help          Show this help"
    echo ""
}

case "${1:-help}" in
    dev)
        check_docker
        setup_env
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        print_info "Starting Docker services..."
        docker compose up -d
        print_success "Docker services started!"
        echo ""
        echo "  ${CYAN}Now run:${NC} pnpm dev"
        ;;

    dev:local)
        setup_env
        print_info "Local mode - using local PostgreSQL and Redis"
        print_warning "Make sure PostgreSQL and Redis are installed locally"
        echo ""
        echo "  ${CYAN}Start app:${NC} pnpm dev"
        ;;

    stop)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose down 2>/dev/null || true
        print_success "Stopped"
        ;;

    restart)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose restart
        print_success "Restarted"
        ;;

    status)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose ps
        ;;

    logs)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose logs -f
        ;;

    db:shell)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose exec postgres psql -U postgres -d $(grep "^DB_DATABASE=" .env | cut -d= -f2)
        ;;

    redis:shell)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose exec redis redis-cli -a redis123
        ;;

    clean)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        print_warning "Remove all containers and data? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY])$ ]]; then
            docker compose down -v
            print_success "Cleaned"
        fi
        ;;

    mode)
        if [ -f ".env" ]; then
            local mode=$(grep "^APP_MODE=" .env | cut -d= -f2 | tr -d '"' | tr -d "'")
            echo -e "Current mode: ${CYAN}$mode${NC}"
        else
            echo "No .env file found"
        fi
        ;;

    help|--help|-h)
        show_help
        ;;
esac