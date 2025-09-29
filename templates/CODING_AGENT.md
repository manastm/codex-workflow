# Coding Agent Guidelines

Specific technical guidelines for code development and maintenance.

## Development Principles

### Code Organization
- **Single Responsibility**: Each function/class should have one clear purpose
- **DRY (Don't Repeat Yourself)**: Abstract common functionality
- **KISS (Keep It Simple)**: Prefer simple solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)**: Don't build features before they're needed

### Quality Standards
- **Type Safety**: Use TypeScript/types where available
- **Error Handling**: Properly handle and log errors
- **Performance**: Consider performance implications of design decisions
- **Security**: Follow security best practices, sanitize inputs

### Testing Strategy
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **Edge Cases**: Include tests for boundary conditions and error states
- **Coverage**: Aim for meaningful test coverage, not just high percentages

## Implementation Workflow

### Before Starting
1. Read existing code to understand patterns and conventions
2. Check for similar implementations that can be reused or extended
3. Verify dependencies and ensure compatibility
4. Plan the implementation approach

### During Development
1. Write small, focused commits with clear messages
2. Test early and often during development
3. Document complex logic with inline comments
4. Keep functions and files reasonably sized

### Before Completion
1. Run all tests and ensure they pass
2. Check code style/linting rules
3. Review for potential security issues
4. Update relevant documentation

## Git Workflow

- **Branch Names**: Use descriptive names (feature/add-auth, fix/login-bug)
- **Commit Messages**: Clear, concise descriptions of changes
- **Pull Requests**: Include context, testing notes, and review checklist
- **Reviews**: Be thorough but constructive in code reviews

---
*Applied automatically during Codex workflow sessions*