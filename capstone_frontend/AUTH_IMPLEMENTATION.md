# Authentication System Documentation

## Overview

This is a production-ready, secure authentication system for the CharityConnect platform, supporting both Donor and Charity user registration with comprehensive document verification.

## Environment Setup

### Required Environment Variable

Set the API base URL in your `.env` file:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

**Important:** Replace with your actual backend API URL before deployment.

## Architecture

### Services

#### `src/services/auth.ts`
Handles all authentication API calls:
- Login/logout
- Donor registration
- Charity registration (with draft saving)
- Email verification
- Password reset flows
- Token management (session/local storage)

#### `src/services/uploads.ts`
Manages document uploads with security features:
- SHA-256 checksum calculation
- File validation (type, size)
- Progress tracking
- Multiple file upload support

### Components

#### `src/components/auth/PasswordStrengthMeter.tsx`
Real-time password validation with visual feedback:
- 5 security requirements tracked
- Color-coded strength indicator
- Accessible checklist display

#### `src/components/auth/FileUploader.tsx`
Advanced file upload component:
- Drag-and-drop support
- Client-side checksum calculation
- Image/PDF preview
- Progress tracking
- Error handling

### Pages

#### Core Auth Pages
- `/auth/login` - Email/password login with "Remember me"
- `/auth/forgot` - Password reset request
- `/auth/reset` - Password reset with token validation
- `/auth/register` - Registration landing (Donor vs Charity selection)

#### Registration Flows
- `/auth/register/donor` - Simple donor registration form
- `/auth/register/charity` - Multi-step charity wizard (4 steps)
- `/auth/verify` - Email verification handler
- `/auth/status` - Post-registration status page

## Design System

### Color Palette (HSL)

The design uses semantic tokens mapped to the charity platform brand:

```css
--brand-accent: #ECA400        /* Primary CTAs, highlights */
--brand-success: #EAF8BF       /* Success states */
--brand-secondary: #006992     /* Secondary actions */
--brand-surface: #27476E       /* Cards, surfaces */
--brand-ink: #001D4A           /* Text, headings */
```

### Spacing Scale

Consistent spacing using CSS custom properties:

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### Typography

- **Font:** Inter (sans-serif)
- **H1:** 32px, bold
- **H2:** 24px, semibold
- **Body:** 16px, regular
- **Small:** 14px

## API Integration

### Expected Backend Endpoints

#### Authentication
```
POST /auth/login
Body: { email, password, remember_me? }
Response: { token, user: { id, email, role } }

POST /auth/logout
Headers: Authorization: Bearer {token}

POST /auth/register
Body: { ...userData, role: 'donor' | 'charity' }
Response: { user }

POST /auth/verify-email
Body: { token }
Response: { message }

POST /auth/resend-verification
Body: { email }
Response: { message }

POST /auth/forgot-password
Body: { email }
Response: { message }

POST /auth/reset-password
Body: { token, password, password_confirmation }
Response: { message }

GET /auth/me
Headers: Authorization: Bearer {token}
Response: { user }
```

#### Charity Registration
```
POST /charities/register
Body: { ...charityData, documents[] }
Response: { registration_id, status }

POST /charities/draft
Body: { ...partialData }
Response: { id }
```

#### File Uploads
```
POST /uploads
Content-Type: multipart/form-data
Body: FormData with file, checksum, filename, size, type
Response: { id, url, filename, checksum, checksum_verified }
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Token Management
- Session storage for temporary sessions
- Local storage for "Remember me" functionality
- Bearer token authentication
- Automatic logout on token expiry

### Input Validation
- Client-side validation before submission
- Clear error messages
- Sanitized user inputs
- Protected against XSS attacks

### File Upload Security
- File type validation (PDF, PNG, JPG only)
- Size limit enforcement (10MB default)
- SHA-256 checksum verification
- Secure multipart upload

### CSRF Protection
- Cookie-based requests with credentials included
- CSRF token handling (if backend requires)

## Accessibility (WCAG AA)

- Semantic HTML structure
- Keyboard navigation support
- Visible focus indicators
- ARIA labels on all form inputs
- Skip navigation links
- High contrast ratios
- Responsive design (mobile-first)

## Charity Registration Flow

### Step 1: Organization Details
Required fields:
- Organization name
- Registration number
- Tax ID
- Contact person details
- Address and location
- Nonprofit category

### Step 2: Profile & Mission
- Mission statement (required)
- Detailed description (required)
- Logo and cover image (optional)

### Step 3: Documents & Compliance
Required documents:
1. Registration certificate (SEC or equivalent)
2. Tax registration (BIR or Tax ID)
3. Representative government ID

Optional documents:
4. Financial statement
5. Additional supporting documents

All files are validated and checksummed client-side.

### Step 4: Review & Submit
- Read-only summary of all entered data
- Confirmation checkboxes
- Terms acceptance required
- Final submission with expected review timeline

## Donor Registration

Single-page form with sections:
- Basic information (name, email, phone, address)
- Security (password with strength meter)
- Preferences (contact method, anonymous giving)
- Terms acceptance

## Testing Checklist

### Login Flow
- [ ] Valid credentials login
- [ ] Invalid credentials error handling
- [ ] "Remember me" functionality
- [ ] Redirect to correct dashboard by role
- [ ] Social login placeholders visible

### Registration Flows
- [ ] Donor registration with all validations
- [ ] Charity multi-step wizard completion
- [ ] Draft saving for charity registration
- [ ] Email verification flow
- [ ] Password reset flow

### File Uploads
- [ ] File type validation
- [ ] File size validation
- [ ] Checksum calculation
- [ ] Upload progress tracking
- [ ] Preview generation (images/PDFs)

### Accessibility
- [ ] Keyboard-only navigation
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] Error announcement

## Customization Guide

### Change Brand Colors

Edit `src/index.css`:

```css
:root {
  --brand-accent: YOUR_PRIMARY_COLOR;     /* Buttons, CTAs */
  --brand-secondary: YOUR_SECONDARY_COLOR; /* Secondary actions */
  --brand-surface: YOUR_SURFACE_COLOR;    /* Cards, backgrounds */
  /* ... etc */
}
```

### Change Spacing Scale

Edit `src/index.css` spacing variables to match your design system.

### Modify Password Rules

Edit `src/components/auth/PasswordStrengthMeter.tsx` requirements array.

### Update File Upload Limits

Edit default values in `src/services/uploads.ts`:

```typescript
const maxSize = 10 * 1024 * 1024; // Change size limit
const allowedTypes = ['application/pdf', 'image/png']; // Change types
```

### Change API Base URL

Update `.env` file:
```bash
VITE_API_BASE_URL=https://api.yourprod.com/api
```

## Development Notes

### Current Limitations
- Social login (Google/Facebook) buttons are placeholders
- Logo/cover image uploads in charity Step 2 are placeholders
- Email templates not included (backend responsibility)

### Future Enhancements
- OAuth integration for social login
- Multi-factor authentication
- Session management dashboard
- Audit log for security events
- Biometric authentication support

## Deployment Checklist

- [ ] Set production `VITE_API_BASE_URL`
- [ ] Review and update all placeholder text
- [ ] Configure CORS on backend
- [ ] Set up SSL/TLS certificates
- [ ] Enable rate limiting on backend
- [ ] Configure email service for verification
- [ ] Set up monitoring and logging
- [ ] Test all flows in production environment
- [ ] Update privacy policy and terms links

## Support

For questions or issues:
- Check this documentation first
- Review backend API documentation
- Verify environment variables are set correctly
- Check browser console for errors

## License

[Your License Here]
