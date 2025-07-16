#!/bin/bash

# DilSeDaan - Complete Application Launcher
# This script sets up and runs the entire DilSeDaan charity platform

set -e

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ASCII Art Logo
print_logo() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                            DilSeDaan - दिल से दान                           ║"
    echo "║                     India's Blockchain-Powered Charity Platform             ║"
    echo "║                                                                              ║"
    echo "║  🏥 Healthcare  📚 Education  🌱 Environment  🤝 Community Development      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm not found. Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check MongoDB connection (optional for local development)
    print_status "Node.js version: $(node -v)"
    print_status "npm version: $(npm -v)"
    print_status "pnpm version: $(pnpm -v)"
    
    print_success "Prerequisites check completed"
}

# Install all dependencies
install_dependencies() {
    print_step "Installing project dependencies..."
    
    # Install root dependencies
    if [ -f package.json ]; then
        print_status "Installing root dependencies..."
        pnpm install --frozen-lockfile 2>/dev/null || pnpm install
    fi
    
    # Install backend dependencies
    if [ -d apps/backend ]; then
        print_status "Installing backend dependencies..."
        cd apps/backend
        npm install
        cd ../..
    fi
    
    # Install frontend dependencies
    if [ -d apps/frontend ]; then
        print_status "Installing frontend dependencies..."
        cd apps/frontend
        pnpm install --frozen-lockfile 2>/dev/null || pnpm install
        cd ../..
    fi
    
    print_success "All dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_step "Setting up environment configuration..."
    
    # Backend environment
    if [ ! -f apps/backend/.env ]; then
        print_status "Creating backend .env file..."
        cat > apps/backend/.env << 'EOF'
# Database Configuration
MONGODB_URI=mongodb+srv://dilsedaancharity:ServingIndia@cluster0.z0sqtgl.mongodb.net/dilsedaan_production?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP)
EMAIL_USER=dilsedaan.charity@gmail.com
EMAIL_PASS=your-email-app-password

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Blockchain Configuration
WEB3_PROVIDER_URL=https://polygon-mainnet.infura.io/v3/your-infura-key
PRIVATE_KEY=your-private-key-for-deployment
CONTRACT_ADDRESS=your-deployed-contract-address

# IPFS Configuration
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:3004
SESSION_SECRET=your-session-secret-key

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# SendGrid (Optional - for production emails)
SENDGRID_API_KEY=your-sendgrid-api-key
EOF
        print_success "Backend .env file created"
    else
        print_status "Backend .env file already exists"
    fi
    
    # Frontend environment
    if [ ! -f apps/frontend/.env ]; then
        print_status "Creating frontend .env file..."
        cat > apps/frontend/.env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:5001/api
VITE_BACKEND_URL=http://localhost:5001

# Frontend Configuration
VITE_APP_NAME=DilSeDaan
VITE_APP_DESCRIPTION=India's Blockchain-Powered Charity Platform

# Blockchain Configuration
VITE_WEB3_PROVIDER_URL=https://polygon-mainnet.infura.io/v3/your-infura-key
VITE_CONTRACT_ADDRESS=your-deployed-contract-address
VITE_CHAIN_ID=137

# IPFS Configuration
VITE_IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Social Media (for sharing)
VITE_TWITTER_HANDLE=@DilSeDaan
VITE_FACEBOOK_PAGE=DilSeDaanIndia

# Google Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_PWA=true
EOF
        print_success "Frontend .env file created"
    else
        print_status "Frontend .env file already exists"
    fi
}

# Build the application
build_application() {
    print_step "Building application for production..."
    
    # Build frontend
    if [ -d apps/frontend ]; then
        print_status "Building frontend application..."
        cd apps/frontend
        pnpm build
        cd ../..
        print_success "Frontend build completed"
    fi
    
    # Build backend (TypeScript compilation)
    if [ -d apps/backend ]; then
        print_status "Compiling backend TypeScript..."
        cd apps/backend
        npm run build 2>/dev/null || print_warning "Backend build script not found (development mode)"
        cd ../..
    fi
}

# Database seeding
seed_database() {
    print_step "Setting up database with initial data..."
    
    if [ -d apps/backend ]; then
        cd apps/backend
        print_status "Running database seeding script..."
        npm run seed 2>/dev/null || print_warning "Database seeding script not found"
        cd ../..
        print_success "Database setup completed"
    fi
}

# Start the application
start_application() {
    print_step "Starting DilSeDaan application..."
    
    # Kill any existing processes on our ports
    print_status "Cleaning up existing processes..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3004 | xargs kill -9 2>/dev/null || true
    
    sleep 2
    
    # Start backend
    print_status "Starting backend server on port 5001..."
    cd apps/backend
    npm run dev &
    BACKEND_PID=$!
    cd ../..
    
    # Wait for backend to start
    sleep 5
    
    # Start frontend
    print_status "Starting frontend development server..."
    cd apps/frontend
    pnpm dev &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait a bit for servers to start
    sleep 3
    
    print_success "DilSeDaan application is starting up!"
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                            🎉 DilSeDaan is Ready! 🎉                        ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║                                                                              ║${NC}"
    echo -e "${CYAN}║  🌐 Frontend (User Interface):    http://localhost:3000                     ║${NC}"
    echo -e "${CYAN}║  ⚙️  Backend API Server:          http://localhost:5001                     ║${NC}"
    echo -e "${CYAN}║  📚 API Documentation:            http://localhost:5001/api-docs            ║${NC}"
    echo -e "${CYAN}║                                                                              ║${NC}"
    echo -e "${CYAN}║  🔧 Admin Panel:                  http://localhost:3000/admin               ║${NC}"
    echo -e "${CYAN}║  📊 Analytics Dashboard:          http://localhost:3000/analytics           ║${NC}"
    echo -e "${CYAN}║  ⛓️  Blockchain Explorer:          http://localhost:3000/blockchain          ║${NC}"
    echo -e "${CYAN}║                                                                              ║${NC}"
    echo -e "${CYAN}║  📧 Test Email:                   dilsedaan.charity@gmail.com               ║${NC}"
    echo -e "${CYAN}║  🔐 Admin Login:                  Indian_tax_dep.charity@gmail.com          ║${NC}"
    echo -e "${CYAN}║  🔑 Admin Password:               ServingIndia                               ║${NC}"
    echo -e "${CYAN}║                                                                              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}💡 Quick Start Tips:${NC}"
    echo -e "   • Visit the homepage to see 6 featured campaigns"
    echo -e "   • Check the Stories page for all 13 Hindi campaigns"
    echo -e "   • Use the admin panel to manage campaigns and donations"
    echo -e "   • Test the donation flow with the integrated payment system"
    echo -e "   • Explore blockchain features for transparency"
    echo ""
    echo -e "${YELLOW}🛑 To stop the servers: Press Ctrl+C${NC}"
    echo ""
    
    # Wait for user interrupt
    trap cleanup INT
    wait
}

# Cleanup function
cleanup() {
    print_status "Shutting down DilSeDaan..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any processes on our ports
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3004 | xargs kill -9 2>/dev/null || true
    
    print_success "DilSeDaan stopped successfully"
    exit 0
}

# Health check function
health_check() {
    print_step "Performing health check..."
    
    sleep 5
    
    # Check backend health
    if curl -f http://localhost:5001/api/health 2>/dev/null; then
        print_success "Backend server is healthy"
    else
        print_warning "Backend server health check failed"
    fi
    
    # Check frontend accessibility
    if curl -f http://localhost:3000 2>/dev/null; then
        print_success "Frontend server is accessible"
    else
        print_warning "Frontend server accessibility check failed"
    fi
}

# Main execution
main() {
    print_logo
    
    # Parse command line arguments
    case "${1:-start}" in
        "install")
            check_prerequisites
            install_dependencies
            setup_environment
            print_success "Installation completed! Run './start-dilsedaan.sh' to start the application."
            ;;
        "build")
            check_prerequisites
            install_dependencies
            setup_environment
            build_application
            print_success "Build completed!"
            ;;
        "seed")
            seed_database
            ;;
        "clean")
            print_status "Cleaning up..."
            rm -rf node_modules apps/*/node_modules apps/*/dist apps/*/build
            print_success "Cleanup completed!"
            ;;
        "start"|"")
            check_prerequisites
            install_dependencies
            setup_environment
            seed_database
            start_application
            ;;
        "health")
            health_check
            ;;
        "help"|"--help"|"-h")
            echo "DilSeDaan Application Launcher"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start     Start the complete application (default)"
            echo "  install   Install dependencies and setup environment"
            echo "  build     Build the application for production"
            echo "  seed      Seed the database with initial data"
            echo "  clean     Clean all dependencies and build files"
            echo "  health    Check application health"
            echo "  help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Start the application"
            echo "  $0 install           # Install dependencies only"
            echo "  $0 build             # Build for production"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Run '$0 help' for usage information."
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
