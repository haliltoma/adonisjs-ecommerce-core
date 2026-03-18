#!/bin/bash

# AdonisCommerce Docker Management Script
# Multi-project support with isolated environments

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

# Get project name from folder
get_project_name() {
    basename "$PROJECT_DIR" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g'
}

# Generate app key
generate_app_key() {
    openssl rand -base64 32 2>/dev/null || head -c 32 | base64
}

# Find available port
find_available_port() {
    local start=$1
    local end=$2
    for port in $(seq $start $end); do
        if ! netstat -tuln 2>/dev/null | grep -q ":$port " && \
           ! ss -tuln 2>/dev/null | grep -q ":$port "; then
            echo $port
            return 0
        fi
    done
    echo $start
}

# Calculate port offset based on project name hash
get_port_offset() {
    local project=$1
    local hash=0
    for ((i=0; i<${#project}; i++)); do
        hash=$((hash + ${project:$i:1}))
    done
    echo $((hash % 50))
}

# Setup environment
setup_env() {
    local project_name=$(get_project_name)
    local port_offset=$(get_port_offset $project_name)

    # Create .env if not exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.docker" ]; then
            cp .env.docker .env
        else
            echo -e "${RED}[ERROR] .env.docker not found${NC}"
            exit 1
        fi
    fi

    # Set COMPOSE_PROJECT_NAME
    if ! grep -q "^COMPOSE_PROJECT_NAME=" .env 2>/dev/null; then
        echo "COMPOSE_PROJECT_NAME=$project_name" >> .env
    else
        sed -i "s|^COMPOSE_PROJECT_NAME=.*|COMPOSE_PROJECT_NAME=$project_name|" .env
    fi

    # Set PROJECT_NAME if not set
    if ! grep -q "^PROJECT_NAME=" .env 2>/dev/null; then
        echo "PROJECT_NAME=$project_name" >> .env
    fi

    # Set APP_KEY if not set
    if grep -q "^APP_KEY=$" .env 2>/dev/null || grep -q "^APP_KEY=$" .env 2>/dev/null; then
        local app_key=$(generate_app_key)
        sed -i "s|^APP_KEY=.*|APP_KEY=$app_key|" .env
    fi

    # Set DB_DATABASE based on project name
    if ! grep -q "^DB_DATABASE=" .env 2>/dev/null; then
        echo "DB_DATABASE=${project_name}_db" >> .env
    else
        sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${project_name}_db|" .env
    fi

    # Set REDIS_DB based on project name (use hash to distribute)
    if ! grep -q "^REDIS_DB=" .env 2>/dev/null; then
        local redis_db=$((port_offset % 16))
        echo "REDIS_DB=$redis_db" >> .env
    fi

    # Auto-assign ports if not set
    local base_app_port=3333
    local app_port=$((base_app_port + port_offset))

    # App port
    if grep -q "^APP_PORT=$" .env 2>/dev/null || ! grep -q "^APP_PORT=" .env 2>/dev/null; then
        sed -i "s|^APP_PORT=.*|APP_PORT=$app_port|" .env
    fi

    # DB port (5432 + offset, mapped to host)
    local db_port=$((5433 + port_offset))
    if grep -q "^DB_PORT=$" .env 2>/dev/null || ! grep -q "^DB_PORT=" .env 2>/dev/null; then
        sed -i "s|^DB_PORT=.*|DB_PORT=$db_port|" .env
    fi

    # Redis port
    local redis_port=$((6380 + port_offset))
    if grep -q "^REDIS_PORT=$" .env 2>/dev/null || ! grep -q "^REDIS_PORT=" .env 2>/dev/null; then
        sed -i "s|^REDIS_PORT=.*|REDIS_PORT=$redis_port|" .env
    fi

    # Tool ports
    local adminer_port=$((8080 + port_offset))
    if grep -q "^ADMINER_PORT=$" .env 2>/dev/null || ! grep -q "^ADMINER_PORT=" .env 2>/dev/null; then
        sed -i "s|^ADMINER_PORT=.*|ADMINER_PORT=$adminer_port|" .env
    fi

    echo -e "${CYAN}[ENV] Project: $project_name${NC}"
    echo -e "${CYAN}[ENV] App Port: $app_port${NC}"
    echo -e "${CYAN}[ENV] DB Port: $db_port${NC}"
    echo -e "${CYAN}[ENV] Redis Port: $redis_port${NC}"
}

# Print info
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
    echo "AdonisCommerce Docker Management"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev           Start development environment"
    echo "  dev:tools     Start with admin tools (Adminer, Redis Commander, MailHog)"
    echo "  prod          Start production environment"
    echo "  stop          Stop all containers"
    echo "  restart       Restart all containers"
    echo "  logs          View application logs"
    echo "  logs:all      View all container logs"
    echo "  shell         Open shell in app container"
    echo "  db:shell      Open PostgreSQL shell"
    echo "  db:migrate    Run migrations"
    echo "  db:seed       Run seeders"
    echo "  db:reset      Reset database"
    echo "  redis:shell   Open Redis CLI"
    echo "  clean         Remove all containers and volumes"
    echo "  status        Show container status"
    echo "  list          List all projects"
    echo "  help          Show this help"
    echo ""
}

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

# Main
case "${1:-help}" in
    dev)
        check_docker
        setup_env
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        print_info "Starting development environment..."
        docker compose up -d
        print_success "Development environment started!"
        echo ""
        echo -e "  ${CYAN}App:${NC}      http://localhost:$(grep '^APP_PORT=' .env | cut -d= -f2)"
        echo -e "  ${CYAN}Project:${NC} $COMPOSE_PROJECT_NAME"
        echo ""
        ;;
    dev:tools)
        check_docker
        setup_env
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        print_info "Starting with tools..."
        docker compose --profile tools up -d
        print_success "Started!"
        APP_PORT=$(grep '^APP_PORT=' .env | cut -d= -f2)
        ADMINER_PORT=$(grep '^ADMINER_PORT=' .env | cut -d= -f2)
        echo ""
        echo -e "  ${CYAN}App:${NC}        http://localhost:$APP_PORT"
        echo -e "  ${CYAN}Adminer:${NC}    http://localhost:$ADMINER_PORT"
        ;;
    prod)
        check_docker
        if [ ! -f ".env" ]; then
            print_error "Create .env from .env.docker.prod"
            exit 1
        fi
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        print_info "Starting production..."
        docker compose -f docker-compose.prod.yml up -d --build
        print_success "Production started!"
        ;;
    stop)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose down 2>/dev/null || true
        docker compose -f docker-compose.prod.yml down 2>/dev/null || true
        print_success "Stopped"
        ;;
    restart)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose restart
        print_success "Restarted"
        ;;
    logs)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose logs -f app
        ;;
    logs:all)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose logs -f
        ;;
    shell)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose exec app sh
        ;;
    db:shell)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose exec postgres psql -U postgres -d $(grep '^DB_DATABASE=' .env | cut -d= -f2)
        ;;
    db:migrate)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose exec app node ace migration:run
        print_success "Migrations done"
        ;;
    db:seed)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose exec app node ace db:seed
        print_success "Seeding done"
        ;;
    db:reset)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        print_warning "Delete all data? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY])$ ]]; then
            docker compose exec app node ace migration:fresh --seed
            print_success "Database reset"
        fi
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
            docker compose down -v --remove-orphans
            print_success "Cleaned"
        fi
        ;;
    status)
        check_docker
        export COMPOSE_PROJECT_NAME=$(get_project_name)
        docker compose ps
        ;;
    list)
        check_docker
        echo -e "${CYAN}Running Projects:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(app|postgres|redis)" || echo "No projects running"
        ;;
    help|--help|-h)
        show_help
        ;;
esac