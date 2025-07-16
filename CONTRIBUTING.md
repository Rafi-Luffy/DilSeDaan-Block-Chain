# 🤝 Contributing to DilSeDaan

Thank you for your interest in contributing to DilSeDaan! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@dilsedaan.com.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18+ installed
- Git installed and configured
- Basic knowledge of React, TypeScript, and Node.js
- Understanding of blockchain concepts (for Web3 features)
- Familiarity with charitable/NGO operations (helpful but not required)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Visit https://github.com/your-username/DilSeDaan and click "Fork"
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/DilSeDaan.git
   cd DilSeDaan
   ```

3. **Set up upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/DilSeDaan.git
   ```

4. **Install dependencies and start development**
   ```bash
   ./start-dilsedaan.sh install
   ./start-dilsedaan.sh
   ```

## 🔄 Development Workflow

### Branching Strategy

We use GitFlow branching model:
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `hotfix/issue-description` - Critical bug fixes
- `release/version-number` - Release preparation

### Creating a Feature Branch

```bash
# Start from develop branch
git checkout develop
git pull upstream develop

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code, test, commit ...

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**
```bash
feat(campaigns): add campaign sharing functionality
fix(payments): resolve Razorpay webhook validation issue
docs(readme): update installation instructions
style(frontend): fix linting errors in HomePage component
refactor(backend): optimize database queries for campaigns
test(auth): add unit tests for authentication service
```

## 📝 Coding Standards

### TypeScript/JavaScript

- **ESLint Configuration**: Follow the existing ESLint rules
- **Prettier Formatting**: Code must be formatted with Prettier
- **Type Safety**: Use TypeScript strictly, avoid `any` types
- **Naming Conventions**:
  - Components: PascalCase (`HomePage`, `DonationForm`)
  - Functions/Variables: camelCase (`getUserData`, `isLoggedIn`)
  - Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
  - Files: kebab-case (`user-profile.tsx`, `email-service.ts`)

### React Components

```typescript
// ✅ Good
interface Props {
  campaignId: string;
  onDonate: (amount: number) => void;
}

export const DonationButton: React.FC<Props> = ({ campaignId, onDonate }) => {
  const [amount, setAmount] = useState<number>(0);
  
  const handleDonate = useCallback(() => {
    onDonate(amount);
  }, [amount, onDonate]);

  return (
    <button onClick={handleDonate} className="btn-primary">
      Donate ₹{amount}
    </button>
  );
};

// ❌ Avoid
export const DonationButton = (props: any) => {
  // ... component logic
};
```

### Backend API

```typescript
// ✅ Good
interface CreateCampaignRequest {
  title: string;
  description: string;
  targetAmount: number;
  category: CampaignCategory;
}

export const createCampaign = async (
  req: Request<{}, {}, CreateCampaignRequest>,
  res: Response
): Promise<void> => {
  try {
    const { title, description, targetAmount, category } = req.body;
    
    // Validate input
    if (!title || !description || targetAmount <= 0) {
      res.status(400).json({ error: 'Invalid campaign data' });
      return;
    }
    
    // Create campaign
    const campaign = await Campaign.create({
      title,
      description,
      targetAmount,
      category,
      createdBy: req.user.id
    });
    
    res.status(201).json({ success: true, campaign });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Database Models

```typescript
// ✅ Good
interface ICampaign extends Document {
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  category: CampaignCategory;
  status: CampaignStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  targetAmount: { type: Number, required: true, min: 100 },
  raisedAmount: { type: Number, default: 0, min: 0 },
  category: { type: String, enum: Object.values(CampaignCategory), required: true },
  status: { type: String, enum: Object.values(CampaignStatus), default: CampaignStatus.PENDING },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

## 🧪 Testing Requirements

### Test Coverage

All contributions must include appropriate tests:
- **Minimum 80% code coverage**
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows

### Running Tests

```bash
# Frontend tests
cd apps/frontend
npm test

# Backend tests
cd apps/backend
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Examples

```typescript
// Unit test example
describe('calculateDonationFee', () => {
  it('should calculate correct fee for standard donation', () => {
    const amount = 1000;
    const expectedFee = 30; // 3% platform fee
    
    expect(calculateDonationFee(amount)).toBe(expectedFee);
  });
  
  it('should handle zero amount', () => {
    expect(calculateDonationFee(0)).toBe(0);
  });
});

// Component test example
describe('DonationButton', () => {
  it('should call onDonate with correct amount', () => {
    const mockOnDonate = jest.fn();
    const { getByRole } = render(
      <DonationButton campaignId="123" onDonate={mockOnDonate} />
    );
    
    fireEvent.click(getByRole('button'));
    expect(mockOnDonate).toHaveBeenCalledWith(expect.any(Number));
  });
});
```

## 📤 Submitting Changes

### Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update API documentation
   - Include screenshots for UI changes

2. **Create Pull Request**
   ```
   Title: Brief description of changes
   
   ## Description
   Detailed description of what this PR does and why.
   
   ## Type of Change
   - [ ] Bug fix (non-breaking change which fixes an issue)
   - [ ] New feature (non-breaking change which adds functionality)
   - [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   [Add screenshots here]
   
   ## Related Issues
   Closes #[issue number]
   ```

3. **Review Process**
   - At least one core maintainer must review
   - All CI checks must pass
   - Conflicts must be resolved
   - Documentation must be updated

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Commit messages follow convention

## 🐛 Reporting Issues

### Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities. Instead:
1. Email security@dilsedaan.com
2. Include detailed reproduction steps
3. Provide impact assessment
4. Allow 90 days for fix before disclosure

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
A clear description of what the bug is.

**Reproduction Steps**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]
- Node.js Version: [e.g., 18.17.0]

**Additional Context**
Any other context about the problem.
```

### Feature Requests

```markdown
**Feature Description**
A clear description of what you want to happen.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
Describe the solution you'd like.

**Alternatives Considered**
Alternative solutions you've considered.

**Additional Context**
Screenshots, mockups, or additional context.
```

## 💡 Development Areas

We welcome contributions in these areas:

### 🎨 Frontend Development
- UI/UX improvements
- Accessibility enhancements
- Performance optimizations
- Mobile responsiveness
- New campaign features
- Dashboard improvements

### ⚙️ Backend Development
- API enhancements
- Database optimizations
- Security improvements
- Payment integrations
- Email system improvements
- Analytics features

### ⛓️ Blockchain Development
- Smart contract improvements
- Gas optimizations
- Multi-chain support
- DeFi integrations
- Governance features

### 📱 Mobile Development
- React Native app
- Progressive Web App improvements
- Push notifications
- Offline functionality

### 🧪 Testing & QA
- Test coverage improvements
- E2E test scenarios
- Performance testing
- Security testing
- Accessibility testing

### 📚 Documentation
- API documentation
- User guides
- Developer tutorials
- Video tutorials
- Translation to regional languages

### 🌍 Internationalization
- Hindi language support
- Regional language additions
- Cultural adaptations
- Local payment methods
- Compliance with local regulations

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor appreciation
- Potential speaking opportunities at conferences
- LinkedIn recommendations (upon request)

### Contributor Levels

- **First-time Contributor**: 1+ merged PR
- **Regular Contributor**: 5+ merged PRs
- **Core Contributor**: 15+ merged PRs + regular involvement
- **Maintainer**: Granted by core team for exceptional contributions

## 📞 Community

### Communication Channels

- **GitHub Discussions**: For general questions and ideas
- **Discord**: Real-time chat with other contributors
- **Email**: contribute@dilsedaan.com for direct contact
- **Twitter**: [@DilSeDaan](https://twitter.com/DilSeDaan) for updates

### Regular Events

- **Weekly Standups**: Every Wednesday at 7:00 PM IST
- **Monthly Contributors Meeting**: First Saturday of each month
- **Quarterly Roadmap Review**: Planning and feedback sessions
- **Annual Contributor Conference**: Virtual meetup with presentations

### Mentorship Program

New contributors can request mentorship:
- Paired with experienced contributors
- Guided through first contribution
- Regular check-ins and support
- Career development advice

## 🙏 Thank You

Every contribution, no matter how small, makes a difference in creating a transparent and efficient charitable ecosystem in India. Together, we're building something that can positively impact millions of lives.

**Happy Contributing! 🎉**

---

**Questions?** Reach out to us at contribute@dilsedaan.com or open a discussion on GitHub.

**Remember:** The best contribution is the one that helps someone in need. Let's build something amazing together! ❤️
