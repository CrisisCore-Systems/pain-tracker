# Pain Tracker Development Makefile
# Common tasks for developers

.PHONY: help install dev build test lint typecheck format clean doctor deploy

# Default target
help: ## Show this help message
	@echo "Pain Tracker Development Commands"
	@echo "================================="
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Quick Start:"
	@echo "  make setup    # First-time setup"
	@echo "  make dev      # Start development server"
	@echo "  make check    # Run all checks"

# Setup and Installation
setup: install env-setup hooks ## Complete first-time setup
	@echo "✅ Setup complete! Run 'make dev' to start developing"

install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	npm ci --legacy-peer-deps

env-setup: ## Set up environment configuration
	@echo "🔧 Setting up environment..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "📄 Created .env from .env.example"; \
		echo "💡 Edit .env to configure your environment"; \
	else \
		echo "📄 .env already exists"; \
	fi

hooks: ## Install git hooks
	@echo "🔗 Installing git hooks..."
	npm run prepare

# Development
dev: ## Start development server
	@echo "🚀 Starting development server..."
	npm run dev

proxy: ## Start API proxy server
	@echo "🔀 Starting API proxy..."
	npm run proxy:start

# Building and Testing
build: ## Build for production
	@echo "🏗️  Building for production..."
	npm run build

build-dev: ## Build for development
	@echo "🏗️  Building for development..."
	VITE_APP_ENVIRONMENT=development npm run build

test: ## Run tests
	@echo "🧪 Running tests..."
	npm run test

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage

test-ui: ## Run tests with UI
	@echo "🧪 Running tests with UI..."
	npm run test:ui

# Code Quality
lint: ## Run ESLint
	@echo "🔍 Running ESLint..."
	npm run lint

lint-fix: ## Fix ESLint issues automatically
	@echo "🔧 Fixing ESLint issues..."
	npm run lint -- --fix

typecheck: ## Run TypeScript type checking
	@echo "📝 Running TypeScript type checking..."
	npm run typecheck

format: ## Format code with Prettier
	@echo "✨ Formatting code..."
	npm run format

# Comprehensive Checks
check: typecheck lint test build ## Run all checks (typecheck, lint, test, build)
	@echo "✅ All checks passed!"

check-pre-commit: ## Run pre-commit checks
	@echo "🔍 Running pre-commit checks..."
	node scripts/pre-commit.js

# Security and Diagnostics
doctor: ## Run environment diagnostics
	@echo "👨‍⚕️ Running environment diagnostics..."
	node scripts/doctor.js

scan-secrets: ## Scan for hardcoded secrets
	@echo "🔐 Scanning for secrets..."
	node scripts/scan-secrets.js

check-merge: ## Check for merge conflict markers
	@echo "🔀 Checking for merge markers..."
	node scripts/check-merge-markers.js

check-security: ## Run all security checks
	@echo "🛡️ Running security checks..."
	node scripts/check-collapse-vectors.js
	node scripts/scan-secrets.js

# Deployment
deploy-preview: build ## Build and preview deployment
	@echo "🌐 Building and starting preview..."
	npm run preview

deploy: ## Deploy to GitHub Pages
	@echo "🚀 Deploying to GitHub Pages..."
	npm run deploy

deploy-precheck: ## Run pre-deployment validation
	@echo "🔍 Running pre-deployment validation..."
	npm run deploy:precheck

deploy-status: ## Show deployment status
	@echo "📊 Checking deployment status..."
	npm run deploy:status

deploy-staging: ## Deploy to staging environment
	@echo "🚀 Deploying to staging..."
	npm run deploy:staging

deploy-production: ## Deploy to production environment
	@echo "🚀 Deploying to production..."
	npm run deploy:production

deploy-rollback: ## Rollback deployment (requires environment and version)
	@echo "🔄 Initiating rollback..."
	@echo "Usage: make deploy-rollback ENV=production VERSION=v1.2.3"
	@if [ -z "$(ENV)" ] || [ -z "$(VERSION)" ]; then \
		echo "❌ ENV and VERSION parameters are required"; \
		echo "Example: make deploy-rollback ENV=production VERSION=v1.2.3"; \
		exit 1; \
	fi
	npm run deploy:rollback $(ENV) $(VERSION)

deploy-healthcheck: ## Run deployment health checks
	@echo "🔍 Running health checks..."
	npm run deploy:healthcheck

deploy-validate: ## Validate deployment configuration
	@echo "🔍 Validating deployment setup..."
	npm run deploy:validate

# Release Management
release-patch: ## Create patch release
	@echo "🎯 Creating patch release..."
	npm run release:patch

release-minor: ## Create minor release
	@echo "🎯 Creating minor release..."
	npm run release:minor

release-major: ## Create major release
	@echo "🎯 Creating major release..."
	npm run release:major

# Maintenance
clean: ## Clean build artifacts and dependencies
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	rm -f package-lock.json

clean-build: ## Clean only build artifacts
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/

reset: clean install ## Clean and reinstall everything
	@echo "🔄 Reset complete!"

# Dependency Management
deps-check: ## Check for outdated dependencies
	@echo "📦 Checking for outdated dependencies..."
	npm outdated

deps-update: ## Update dependencies
	@echo "📦 Updating dependencies..."
	npm update

deps-audit: ## Audit dependencies for vulnerabilities
	@echo "🔒 Auditing dependencies..."
	npm audit

deps-audit-fix: ## Fix dependency vulnerabilities
	@echo "🔧 Fixing dependency vulnerabilities..."
	npm audit fix

# Documentation
docs-serve: ## Serve documentation locally (if available)
	@echo "📚 Serving documentation..."
	@if [ -f "docs/package.json" ]; then \
		cd docs && npm run serve; \
	else \
		echo "❌ No documentation setup found"; \
	fi

# Git helpers
git-hooks-test: ## Test git hooks
	@echo "🔗 Testing git hooks..."
	git commit --allow-empty -m "test: git hooks test [skip all]"

# Development utilities
ports: ## Show ports used by the application
	@echo "🔌 Application ports:"
	@echo "  Development server: http://localhost:3000"
	@echo "  Test UI:           http://localhost:51204"
	@echo "  Preview:           http://localhost:4173"

logs: ## Show development logs
	@echo "📄 Checking for log files..."
	@find . -name "*.log" -type f -not -path "./node_modules/*" | head -10

# Performance
perf-build: ## Analyze build performance
	@echo "📊 Analyzing build performance..."
	npm run build -- --mode development --minify false

size-check: build ## Check bundle size
	@echo "📏 Checking bundle size..."
	@ls -lah dist/assets/

# Environment info
info: ## Show environment information
	@echo "💻 Environment Information"
	@echo "========================="
	@echo "Node.js: $$(node --version)"
	@echo "npm:     $$(npm --version)"
	@echo "Git:     $$(git --version)"
	@echo "OS:      $$(uname -s)"
	@echo "PWD:     $$(pwd)"
	@echo ""
	@echo "📦 Package Information"
	@echo "====================="
	@node -e "const pkg = require('./package.json'); console.log('Name:    ' + pkg.name); console.log('Version: ' + pkg.version);"

# Advanced targets
ci: install check ## Run CI pipeline locally
	@echo "🤖 Running CI pipeline..."

watch: ## Watch files and run checks on changes
	@echo "👀 Watching files for changes..."
	npx nodemon --exec "make check-pre-commit" --watch src --watch scripts --ext "ts,tsx,js,jsx"

# Database (if implemented)
db-reset: ## Reset database (safe placeholder)
	@echo "💾 Running safe database reset script..."
	node scripts/db/reset.cjs

db-migrate: ## Run database migrations (safe placeholder)
	@echo "💾 Running safe database migrations script..."
	node scripts/db/migrate.cjs

db-seed: ## Seed database with test data (safe placeholder)
	@echo "💾 Running safe database seeding script..."
	node scripts/db/seed.cjs

# SBOM and Docs Validation
sbom: ## Generate CycloneDX SBOM (security/sbom-latest.json)
	@echo "📦 Generating SBOM..."
	npm run sbom || echo "⚠️ sbom script not configured yet"

docs-validate: ## Validate documentation links & test drift
	@echo "🧪 Validating documentation..."
	npm run docs:validate || echo "⚠️ docs:validate script not configured yet"