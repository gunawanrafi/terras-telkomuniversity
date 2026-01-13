# Contributing to TERRAS

First off, thank you for considering contributing to TERRAS! 🎉

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. Please be kind and courteous.

## How Can I Contribute?

### Reporting Bugs

**Before Submitting:**
- Check existing issues to avoid duplicates
- Collect information about the bug (OS, browser, Docker version, etc.)

**Submit a Bug Report:**
1. Use GitHub Issues
2. Title: Clear and descriptive
3. Description: Steps to reproduce, expected vs actual behavior
4. Environment: OS, Node.js version, Docker version
5. Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please:
1. Open an issue with `[Feature Request]` in the title
2. Explain the use case
3. Describe the proposed solution
4. Consider alternatives

### Pull Requests

**Process:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

**Guidelines:**
- Follow existing code style
- Write meaningful commit messages
- Update documentation if needed
- Add tests for new features
- Ensure all tests pass

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/terras-room-booking.git
cd terras-room-booking

# Install dependencies
npm install

# Start development
docker-compose up
```

## Coding Standards

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Proper error handling

### Git Commit Messages
```
feat: Add new booking feature
fix: Resolve mobile scroll issue
docs: Update API documentation
style: Format code with Prettier
refactor: Improve room service logic
test: Add booking service tests
```

## Testing

```bash
# Run all tests
npm test

# Run specific service tests
cd services/auth
npm test
```

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

---

**Thank you for contributing! 🙏**
