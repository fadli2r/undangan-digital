# NextAuth Admin Implementation Guide

## Overview
Implementasi NextAuth untuk sistem admin dashboard dengan authentication berbasis credentials dan Google OAuth.

## Files Created/Modified

### 1. NextAuth Configuration
- **File**: `pages/api/auth/[...nextauth].js`
- **Features**:
  - Google OAuth provider
  - Credentials provider untuk admin login
  - Session management dengan JWT
  - Automatic admin creation
  - Login history tracking

### 2. Admin Dashboard Pages
- **File**: `pages/admin/index.js`
- **Features**:
  - NextAuth session management
  - Admin role verification
  - Server-side authentication check
  - Loading states

### 3. Admin Layout Components
- **File**: `components/layouts/AdminLayout.js`
- **Features**:
  - Metronic theme integration
  - Session-aware navigation
  - Logout functionality

### 4. Dashboard Content
- **File**: `components/admin/DashboardContent-fixed.js`
- **Features**:
  - Real-time statistics
  - Error handling
  - Loading states

### 5. Middleware Protection
- **File**: `middleware.js`
- **Features**:
  - Route protection for admin paths
  - NextAuth integration
  - Automatic redirects

### 6. Admin Model
- **File**: `models/Admin.js`
- **Features**:
  - Password hashing with bcrypt
  - Role-based permissions
  - Login history tracking
  - Initial admin creation method

## Authentication Flow

### 1. Admin Login Process
```
User accesses /admin → Middleware checks session → 
If not authenticated → Redirect to /admin/login →
Login with credentials → NextAuth validates → 
Create session → Redirect to /admin dashboard
```

### 2. Session Management
- JWT-based sessions
- Admin role stored in token
- Permissions cached in session
- Automatic session refresh

### 3. Route Protection
- Middleware protects all `/admin/*` and `/api/admin/*` routes
- Server-side authentication in getServerSideProps
- Client-side session checks with useSession

## Admin User Setup

### Default Admin Credentials
- **Email**: admin@undangandigital.com
- **Password**: admin123
- **Role**: superadmin

### Creating Admin User
```bash
# Using API endpoint
curl -X POST http://localhost:3000/api/admin/create-initial-admin

# Or using script
node scripts/init-admin.js
```

## Environment Variables Required
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - NextAuth signin
- `POST /api/auth/signout` - NextAuth signout
- `GET /api/auth/session` - Get current session

### Admin Management
- `POST /api/admin/create-initial-admin` - Create initial admin
- `GET /api/admin/dashboard/stats-fixed` - Dashboard statistics

## Security Features

### 1. Password Security
- bcrypt hashing with salt rounds
- Minimum password length validation
- Password comparison method

### 2. Session Security
- JWT tokens with expiration
- Secure cookie settings
- CSRF protection

### 3. Route Protection
- Middleware-level protection
- Role-based access control
- Server-side validation

## Usage Examples

### 1. Protecting a Page
```javascript
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <Loading />;
  if (!session?.user?.isAdmin) return <Unauthorized />;
  
  return <AdminContent />;
}
```

### 2. Server-side Protection
```javascript
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session?.user?.isAdmin) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  
  return { props: { session } };
}
```

### 3. API Route Protection
```javascript
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session?.user?.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Admin-only logic here
}
```

## Troubleshooting

### Common Issues
1. **Session not persisting**: Check NEXTAUTH_SECRET and NEXTAUTH_URL
2. **Admin not found**: Run create-initial-admin endpoint
3. **Redirect loops**: Verify middleware configuration
4. **Database connection**: Check MongoDB URI and connection

### Debug Mode
Enable NextAuth debug mode:
```env
NEXTAUTH_DEBUG=true
```

## Testing Checklist
- [ ] Admin user creation
- [ ] Login with credentials
- [ ] Session persistence
- [ ] Route protection
- [ ] Logout functionality
- [ ] Dashboard data loading
- [ ] Error handling
