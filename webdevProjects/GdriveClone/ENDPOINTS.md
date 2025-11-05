# 🚀 Server is Running on http://localhost:1030

## ✅ The 404 Error is NORMAL!

When you visit `http://localhost:1030/` you get a 404 error because **we don't have a root route**. This is correct!

The server is a **REST API backend** - it's meant to be accessed by the React frontend, not directly in a browser.

---

## ✅ Working Endpoints

### Test in Browser:
- **http://localhost:1030/health** - Should show: `OK`

### Test with curl or Postman:

#### Authentication:
```bash
# Register
curl -X POST http://localhost:1030/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"User Name"}'

# Login
curl -X POST http://localhost:1030/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get current user
curl http://localhost:1030/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Files (requires authentication):
```bash
# List files
curl http://localhost:1030/api/files \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload file
curl -X POST http://localhost:1030/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.txt"

# Recent files
curl http://localhost:1030/api/files/recent \
  -H "Authorization: Bearer YOUR_TOKEN"

# Starred files
curl http://localhost:1030/api/files/starred \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search files
curl "http://localhost:1030/api/files/search?q=myfile" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 How to Use This Backend

### Option 1: With React Frontend (Recommended)
1. Start this backend: `go run cmd/server/main.go`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: **http://localhost:5173**

### Option 2: With Postman/Insomnia
1. Import the endpoints above
2. Test each endpoint manually

### Option 3: With curl
1. Use the curl commands above

---

## ❌ Why http://localhost:1030/ Shows 404

This is a **REST API server**, not a website.

**It doesn't have:**
- ❌ A home page
- ❌ HTML pages
- ❌ Static website

**It does have:**
- ✅ JSON API endpoints
- ✅ File upload/download
- ✅ Database operations
- ✅ Authentication

**Think of it like:**
- GitHub's API: `api.github.com` (not meant to be viewed in browser)
- Your backend: `localhost:1030/api/*` (same thing!)

---

## ✅ Server Status: RUNNING PERFECTLY!

```
✅ Connected to database
🚀 Server starting on http://localhost:1030
📁 Storage path: storage/uploads
🔒 CORS enabled for: http://localhost:5173
```

---

## 📝 Quick Test

Open your browser and visit:
- ✅ **http://localhost:1030/health** → Should show `OK`
- ❌ **http://localhost:1030/** → 404 is NORMAL and CORRECT

---

**Your backend is working perfectly! The 404 on root is expected behavior for a REST API. 🎉**
