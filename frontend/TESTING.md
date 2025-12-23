# Testing Guide

This document provides guidance on running and writing tests for the Aquarium Visit Log application.

## Overview

This project uses different testing frameworks for backend and frontend:
- **Backend**: RSpec for Rails API testing
- **Frontend**: Jest + React Testing Library for component testing

## Backend Testing (Rails + RSpec)

### Running Tests

```bash
# Run all specs
bundle exec rspec

# Run specific file
bundle exec rspec spec/requests/api/v1/rankings_spec.rb

# Run with documentation format
bundle exec rspec --format documentation

# Run specific test by line number
bundle exec rspec spec/requests/api/v1/rankings_spec.rb:17
```

### Test Structure

Tests are organized in `backend/spec/`:
- `spec/requests/` - API endpoint tests
- `spec/models/` - Model tests
- `spec/factories/` - FactoryBot factories for test data

### Writing Request Tests

Example request test structure:

```ruby
require 'rails_helper'

RSpec.describe "Api::V1::Rankings", type: :request do
  describe "GET /api/v1/rankings/most_visited" do
    # Setup test data
    let!(:user) { create(:user) }
    let!(:aquarium) { create(:aquarium, name: "Test Aquarium") }

    before do
      create_list(:visit, 10, aquarium: aquarium, user: user)
    end

    it "returns aquariums ranked by visit count" do
      get "/api/v1/rankings/most_visited"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['rankings']).to be_an(Array)
      expect(json['rankings'].first['name']).to eq("Test Aquarium")
    end
  end
end
```

### Using Factories

FactoryBot provides test data generation:

```ruby
# Create a single record
user = create(:user)

# Create multiple records
visits = create_list(:visit, 5, user: user)

# Build without saving
aquarium = build(:aquarium)

# Override attributes
user = create(:user, email: "custom@example.com")

# Use traits
admin = create(:user, :admin)
```

### Test Database Setup

```bash
# Create test database
RAILS_ENV=test bundle exec rails db:create

# Run migrations
RAILS_ENV=test bundle exec rails db:migrate

# Reset test database
RAILS_ENV=test bundle exec rails db:reset
```

## Frontend Testing (Jest + React Testing Library)

### Running Tests

```bash
# From frontend directory
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginPage.test.tsx
```

### Test Structure

Tests are organized in `frontend/src/__tests__/`:
- Component tests
- Integration tests
- Utility function tests

### Writing Component Tests

Example component test:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Test utilities
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  it('renders login form', () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  it('allows user input', () => {
    renderWithProviders(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput).toHaveValue('test@example.com');
  });
});
```

### Common Testing Patterns

#### Querying Elements

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i })

// By label text
screen.getByLabelText(/email/i)

// By text content
screen.getByText(/welcome/i)

// By test ID (last resort)
screen.getByTestId('custom-element')
```

#### User Interactions

```typescript
// Click
fireEvent.click(button)

// Type
fireEvent.change(input, { target: { value: 'text' } })

// Submit form
fireEvent.submit(form)
```

#### Async Testing

```typescript
// Wait for element
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})

// Wait for element to appear
const element = await screen.findByText(/loading complete/i)
```

## Best Practices

### Backend

1. **Use factories** instead of fixtures for flexible test data
2. **Test behavior, not implementation** - focus on API responses
3. **Keep tests isolated** - each test should be independent
4. **Use descriptive test names** - clearly state what is being tested
5. **Mock external services** - don't make real API calls in tests

### Frontend

1. **Test user behavior** - simulate what users actually do
2. **Use semantic queries** - prefer getByRole over testId
3. **Keep tests simple** - one assertion per test when possible
4. **Mock API calls** - use MSW (Mock Service Worker) for API mocking
5. **Accessibility matters** - tests that query by label/role also verify accessibility

## Test Coverage

### Backend Coverage

```bash
# Using SimpleCov (add to Gemfile if needed)
bundle exec rspec

# Coverage report in coverage/index.html
open coverage/index.html
```

### Frontend Coverage

```bash
cd frontend
npm test -- --coverage --watchAll=false

# Coverage report in frontend/coverage/lcov-report/index.html
open coverage/lcov-report/index.html
```

## Continuous Integration

For CI/CD pipelines, run:

```bash
# Backend
RAILS_ENV=test bundle exec rspec

# Frontend
cd frontend && npm test -- --watchAll=false --coverage
```

## Troubleshooting

### Backend

**Issue**: Tests fail with database errors
```bash
# Solution: Reset test database
RAILS_ENV=test bundle exec rails db:reset
```

**Issue**: Factory errors
```bash
# Solution: Check factory definitions match model schema
bundle exec rails db:schema:dump
```

### Frontend

**Issue**: Cannot find module errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Tests timeout
```bash
# Solution: Increase Jest timeout in jest.config.js or test file
jest.setTimeout(10000)
```

## Resources

- [RSpec Documentation](https://rspec.info/)
- [FactoryBot Guide](https://github.com/thoughtbot/factory_bot)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)

## Next Steps for Expanding Tests

1. **Backend**:
   - Add model tests for validations and associations
   - Test authentication and authorization
   - Add tests for photo upload functionality
   - Test error handling

2. **Frontend**:
   - Test form validation
   - Test API integration with MSW
   - Test routing and navigation
   - Add snapshot tests for UI components

---

Remember: Tests are documentation that executable! Write tests that clearly express intent.
