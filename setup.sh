

# 5. START DEVELOPMENT SERVERS
# ============================

# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Start frontend
cd ../frontend
npm run dev

# Terminal 3: Start database (if using Docker)
docker-compose up -d postgres redis mosquitto

# Terminal 4: Start device simulator (optional)
cd ../backend
npm run test:simulator

# TROUBLESHOOTING IMPORT ERRORS
# =============================

# If you still see red import statements after installation:

# 1. Restart your IDE/editor completely
# 2. Delete node_modules and reinstall:
#    rm -rf node_modules package-lock.json
#    npm install

# 3. Check TypeScript configuration:
#    Make sure tsconfig.json exists in both backend and frontend

# 4. For VS Code users:
#    - Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
#    - Type "TypeScript: Restart TS Server"
#    - Press Enter

# 5. Verify Node.js version:
#    node --version  # Should be 18 or higher

# 6. Clear npm cache if needed:
#    npm cache clean --force

# COMMON PACKAGE INSTALLATION ISSUES
# ==================================

# Issue: "Cannot find module" errors
# Solution: Make sure you're in the correct directory (backend or frontend)

# Issue: "ERESOLVE unable to resolve dependency tree"
# Solution: Try installing with --legacy-peer-deps flag:
#    npm install --legacy-peer-deps

# Issue: Permission errors on macOS/Linux
# Solution: Don't use sudo with npm. Fix npm permissions:
#    mkdir ~/.npm-global
#    npm config set prefix '~/.npm-global'
#    echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
#    source ~/.profile

# Issue: Network/proxy issues
# Solution: Configure npm proxy settings:
#    npm config set proxy http://proxy-server:port
#    npm config set https-proxy http://proxy-server:port

# FINAL VERIFICATION COMMANDS
# ===========================

# Check that all imports work:
: <<'COMMENT'
This is a block comment
using a no-op (:) and a heredoc.
It won't be executed.
cd ../backend
npx tsc --noEmit  # Should complete without errors

cd ../frontend  
npx tsc --noEmit  # Should complete without errors

# Test builds:
cd ../backend
npm run build

cd ../frontend
npm run build

echo "✅ If all commands above complete successfully, your installation is ready!"
COMMENT
