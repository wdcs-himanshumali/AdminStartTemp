# AdminStartTemp

Vuexy Admin Starter Admin Panel

## Development Setup

### API Layer

This project uses TanStack Query (React Query) and Axios for API management. The setup includes:

#### Axios Configuration

- Base URL configuration
- Request/Response interceptors
- Authentication token handling
- Error handling
- Refresh token logic (commented out, ready to implement)

#### React Query Setup

- Query client configuration
- Default options for queries
- React Query DevTools in development
- Automatic cache invalidation
- Optimistic updates support

#### API Service Structure

```typescript
// Example usage of API hooks
const { data: users, isLoading } = useUsers()
const { data: user } = useUser(userId)
const { mutate: createUser } = useCreateUser()
const { mutate: updateUser } = useUpdateUser()
const { mutate: deleteUser } = useDeleteUser()
```

#### Available API Hooks

- `useUsers()`: Fetch all users
- `useUser(id)`: Fetch single user
- `useCreateUser()`: Create new user
- `useUpdateUser()`: Update existing user
- `useDeleteUser()`: Delete user

#### Error Handling

The API layer includes built-in error handling for:

- Network errors
- Authentication errors (401)
- Token refresh logic
- Request timeouts

### Git Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification. This means that all your commit messages must be formatted according to a specific structure:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `ci`: Changes to CI configuration files and scripts
- `build`: Changes that affect the build system or external dependencies
- `revert`: Reverts a previous commit

#### Examples

```bash
# Feature
git commit -m "feat: add user authentication system"
git commit -m "feat(auth): implement OAuth2 login"

# Bug Fix
git commit -m "fix: resolve login form validation issue"
git commit -m "fix(api): handle null response from user endpoint"

# Documentation
git commit -m "docs: update API documentation"
git commit -m "docs(readme): add setup instructions"

# Style
git commit -m "style: format code according to prettier rules"
git commit -m "style(components): fix indentation in Button component"

# Refactor
git commit -m "refactor: simplify authentication logic"
git commit -m "refactor(utils): optimize data processing function"

# Performance
git commit -m "perf: optimize database queries"
git commit -m "perf(images): implement lazy loading"

# Test
git commit -m "test: add unit tests for auth service"
git commit -m "test(api): add integration tests for user endpoints"

# Chore
git commit -m "chore: update dependencies"
git commit -m "chore(deps): upgrade react to latest version"

# CI
git commit -m "ci: update GitHub Actions workflow"
git commit -m "ci(docker): update docker build configuration"

# Build
git commit -m "build: update webpack configuration"
git commit -m "build(deps): add new development dependencies"

# Revert
git commit -m "revert: remove experimental feature"
git commit -m "revert(auth): revert to previous authentication method"
```

#### Commit Message Rules

- The type and description are required
- The type must be lowercase
- The description should be in present tense
- The description should not end with a period
- The description should not be capitalized
- The body and footer are optional
- The body should be separated from the header by a blank line
- The footer should be separated from the body by a blank line

#### Development Tools

This project uses several development tools to maintain code quality:

- **Husky**: Git hooks for running scripts before commits
- **lint-staged**: Runs linters on staged files
- **commitlint**: Enforces conventional commit messages

These tools will automatically:

1. Run ESLint and Prettier on staged files before each commit
2. Validate your commit message format
3. Prevent the commit if either check fails

### Linting & Formatting

To maintain code quality and consistency, use the following commands:

- **Fix linting and formatting issues in all files:**

  ```bash
  npm run lint:fix
  ```

  This command runs ESLint and Prettier on your entire codebase and automatically fixes most issues.

- **Fix linting and formatting issues in staged files (pre-commit):**
  ```bash
  npx lint-staged
  ```
  This command runs ESLint and Prettier only on files that are staged for commit, as part of the pre-commit hook.
