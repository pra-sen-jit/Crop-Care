#!/bin/bash

# Git commands to push the profile page changes to GitHub

echo "🚀 Pushing Crop Care Profile Page to GitHub..."

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add comprehensive user profile page

- Created new profile page at /profile route
- Implemented breadcrumb navigation (Home >> Profile)
- Added user information display with edit functionality
- Included prominent logout button in header
- Added responsive design matching site aesthetics
- Integrated with existing authentication system
- Added quick stats and account settings sections
- Maintained footer while removing navbar from profile page
- Added proper loading states and error handling"

# Push to main branch
git push origin main

echo "✅ Successfully pushed to GitHub!"
echo "📝 Changes include:"
echo "   - New profile page with full user management"
echo "   - Breadcrumb navigation"
echo "   - Responsive design"
echo "   - Edit profile functionality"
echo "   - Account settings section"
echo "   - Proper authentication integration"