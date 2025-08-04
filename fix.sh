#!/bin/bash

# Ubuntu PostgreSQL Installation Fix
# ==================================

echo "🔧 Fixing PostgreSQL installation on Ubuntu..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
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

# Step 1: Clean up and fix package sources
print_step "1. Cleaning up package cache and fixing sources..."

sudo apt clean
sudo apt autoclean
sudo rm -rf /var/lib/apt/lists/*

print_success "Package cache cleaned"

# Step 2: Update package lists
print_step "2. Updating package lists..."

if sudo apt update; then
    print_success "Package lists updated successfully"
else
    print_warning "Package update had some issues, trying to fix..."
    sudo apt update --fix-missing
fi

# Step 3: Install PostgreSQL with specific version handling
print_step "3. Installing PostgreSQL..."

# Try to install PostgreSQL with automatic version detection
if sudo apt install -y postgresql postgresql-contrib postgresql-client; then
    print_success "PostgreSQL installed successfully"
else
    print_warning "Standard installation failed, trying alternative approach..."
    
    # Try installing specific versions available
    print_step "Checking available PostgreSQL versions..."
    apt list -a postgresql 2>/dev/null | head -10
    
    # Try installing whatever version is available
    if sudo apt install -y postgresql-common postgresql-client-common; then
        print_step "Installing PostgreSQL server..."
        sudo apt install -y postgresql postgresql-contrib
    else
        print_error "PostgreSQL installation failed"
        echo ""
        echo "🛠️  Manual fix required:"
        echo "1. Check your Ubuntu version: lsb_release -a"
        echo "2. Visit: https://www.postgresql.org/download/linux/ubuntu/"
        echo "3. Follow the official PostgreSQL APT repository setup"
        exit 1
    fi
fi

# Step 4: Start and enable PostgreSQL service
print_step "4. Starting PostgreSQL service..."

# Check if systemctl is available
if command -v systemctl &> /dev/null; then
    # Try to start PostgreSQL service
    if sudo systemctl start postgresql; then
        print_success "PostgreSQL service started"
        sudo systemctl enable postgresql
        print_success "PostgreSQL service enabled for startup"
    else
        print_warning "Service start failed, checking service name..."
        
        # Try alternative service names
        for service_name in postgresql postgresql-16 postgresql-15 postgresql-14; do
            if sudo systemctl list-unit-files | grep -q $service_name; then
                print_step "Found service: $service_name"
                if sudo systemctl start $service_name; then
                    print_success "Started $service_name service"
                    sudo systemctl enable $service_name
                    break
                fi
            fi
        done
    fi
else
    print_warning "systemctl not available, trying service command..."
    sudo service postgresql start || print_warning "Service start may have failed"
fi

# Step 5: Check PostgreSQL status
print_step "5. Checking PostgreSQL status..."

if pgrep -x postgres > /dev/null; then
    print_success "PostgreSQL is running"
else
    print_warning "PostgreSQL may not be running, let's check..."
    
    # Try to find PostgreSQL processes
    ps aux | grep postgres | grep -v grep || print_warning "No PostgreSQL processes found"
fi

# Step 6: Setup PostgreSQL user and database
print_step "6. Setting up PostgreSQL user and database..."

# Wait a moment for PostgreSQL to fully start
sleep 3

# Check if postgres user exists
if id postgres &>/dev/null; then
    print_success "PostgreSQL user 'postgres' exists"
    
    # Create database and set password
    if sudo -u postgres createdb edge_ai_tracking 2>/dev/null; then
        print_success "Database 'edge_ai_tracking' created"
    else
        print_warning "Database may already exist or creation failed"
    fi
    
    # Set password for postgres user
    if sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';" 2>/dev/null; then
        print_success "Password set for postgres user"
    else
        print_warning "Password setting may have failed"
    fi
    
else
    print_error "PostgreSQL user 'postgres' not found"
    print_step "Creating PostgreSQL user manually..."
    
    # Try to create postgres user
    sudo useradd -m postgres 2>/dev/null || print_warning "User creation may have failed"
fi

# Step 7: Install PostgreSQL client tools
print_step "7. Installing PostgreSQL client tools..."

if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql-client postgresql-client-common
    
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client tools installed"
    else
        print_warning "Client tools installation may have failed"
    fi
else
    print_success "PostgreSQL client tools already available"
fi

# Step 8: Test connection
print_step "8. Testing PostgreSQL connection..."

# Wait for PostgreSQL to be ready
sleep 5

# Test connection
if sudo -u postgres psql -c "SELECT version();" 2>/dev/null | grep -q PostgreSQL; then
    print_success "PostgreSQL connection test successful"
    
    # Show PostgreSQL version
    PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" 2>/dev/null | head -1)
    echo "   Version: $PG_VERSION"
    
else
    print_warning "Direct connection test failed, trying alternative..."
    
    # Try connecting as current user
    if psql -h localhost -U postgres -d postgres -c "SELECT 1;" 2>/dev/null; then
        print_success "Alternative connection successful"
    else
        print_warning "Connection tests failed - manual configuration may be needed"
    fi
fi

# Step 9: Configure PostgreSQL for local connections
print_step "9. Configuring PostgreSQL for local connections..."

# Find PostgreSQL config directory
PG_CONFIG_DIR=$(sudo -u postgres psql -t -c "SHOW config_file;" 2>/dev/null | xargs dirname 2>/dev/null)

if [ -n "$PG_CONFIG_DIR" ] && [ -d "$PG_CONFIG_DIR" ]; then
    print_success "Found PostgreSQL config directory: $PG_CONFIG_DIR"
    
    # Backup and modify pg_hba.conf for local connections
    if [ -f "$PG_CONFIG_DIR/pg_hba.conf" ]; then
        sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup"
        
        # Add local connection rule if not exists
        if ! sudo grep -q "local.*all.*postgres.*trust" "$PG_CONFIG_DIR/pg_hba.conf"; then
            echo "local   all             postgres                                trust" | sudo tee -a "$PG_CONFIG_DIR/pg_hba.conf" > /dev/null
            print_success "Added local trust connection for postgres user"
            
            # Restart PostgreSQL to apply changes
            sudo systemctl restart postgresql 2>/dev/null || sudo service postgresql restart 2>/dev/null
            sleep 3
        fi
    fi
else
    print_warning "Could not find PostgreSQL config directory"
fi

# Step 10: Final verification
print_step "10. Final verification..."

echo ""
echo "🔍 System Status:"
echo "================="

# Check service status
if systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "✅ PostgreSQL service: Active"
elif pgrep postgres > /dev/null; then
    echo "✅ PostgreSQL processes: Running"
else
    echo "⚠️  PostgreSQL service: Unknown status"
fi

# Check if database exists
if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw edge_ai_tracking; then
    echo "✅ Database 'edge_ai_tracking': Exists"
else
    echo "⚠️  Database 'edge_ai_tracking': Not found"
fi

# Check client tools
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client tools: Available"
    echo "   Version: $(psql --version)"
else
    echo "⚠️  PostgreSQL client tools: Not found"
fi

echo ""
echo "🚀 Next Steps:"
echo "============="
echo ""
echo "1. Test the connection manually:"
echo "   sudo -u postgres psql -d edge_ai_tracking"
echo ""
echo "2. If that works, test from your app:"
echo "   psql -h localhost -U postgres -d edge_ai_tracking"
echo "   (Enter password: password)"
echo ""
echo "3. Start your backend:"
echo "   cd backend && npm run start:dev"
echo ""

echo "🛠️  If connection still fails:"
echo "=============================="
echo ""
echo "1. Check PostgreSQL is listening on port 5432:"
echo "   sudo netstat -tulpn | grep 5432"
echo ""
echo "2. Check logs for errors:"
echo "   sudo journalctl -u postgresql -f"
echo ""
echo "3. Reset postgres user password:"
echo "   sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'password';\""
echo ""
echo "4. Create database manually:"
echo "   sudo -u postgres createdb edge_ai_tracking"
echo ""

# Alternative: Simple PostgreSQL installation via snap
echo "🔄 Alternative Installation Method:"
echo "=================================="
echo ""
echo "If the above doesn't work, try installing via snap:"
echo "   sudo snap install postgresql15"
echo "   sudo snap start postgresql15"
echo ""

print_success "PostgreSQL installation fix completed! 🎯"

echo ""
echo "📋 Quick Test Commands:"
echo "======================"
echo ""
echo "# Test 1: Check if PostgreSQL is running"
echo "ps aux | grep postgres"
echo ""
echo "# Test 2: Try connecting as postgres user"
echo "sudo -u postgres psql"
echo ""
echo "# Test 3: Try connecting from your app"
echo "psql -h localhost -U postgres -d edge_ai_tracking"
echo ""
echo "# Test 4: Start your backend"
echo "cd backend && npm run start:dev"