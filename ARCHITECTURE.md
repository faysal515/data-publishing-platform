# Dataset Publishing Platform - Architecture Overview

## System Overview

The Dataset Publishing Platform is a modern web application designed to facilitate dataset publishing with AI-powered metadata generation. The system follows a client-server architecture with:

- Frontend: Next.js + React (TypeScript)
- Backend: Express.js + TypeScript
- Database: MongoDB
- File Storage: Local filesystem (simplified)

## Key Design Decisions & Trade-offs

### 1. Authentication & Authorization

**Current Implementation:**
- Simplified for development speed

- Simple role-based mock authentication with role toggle (editor/admin)
- No backend authentication middleware
- Role-based UI rendering on frontend

### 2. File Processing & Storage

**Current Implementation:**
- Local filesystem storage for processed files

- Mixed processing approach:
  - CSV files: Stream-based processing for content analysis
  - Excel files: In-memory processing
- Initial upload uses memory storage (Multer)
- File size limit of 10MB
- 
**Possible Better options**
- Use Cloud Storage like S3 or Azure file storage.
- Have a dedicated microservice for file processing to keep api service available only api requests.

### 3. Metadata Generation

**Current Implementation:**
- Immediate asynchronous metadata generation
- Direct API calls to AI service
- Simple retry mechanism from sdk

**Better approach**
  - Message queue (RabbitMQ/Redis) for async processing
  - Retry mechanism with exponential backoff
  
### 4. Version Control

**Current Implementation:**
- Simple but effective versioning system
- Versions stored within dataset document
- Each version tracks:
  - Version number
  - File metadata and location
  - Column information
  - Upload date and stats
- Actual files stored in filesystem

**Why This Works:**
- MongoDB's 16MB document limit is sufficient for version metadata
- Common operations (get latest, list versions) are efficient
- Maintains data locality
- Avoids complex joins/lookups
- Realistic for expected version counts (tens of versions)

### 5. Database Design

**Current Implementation:**
- MongoDB with Mongoose
- Single collection with embedded versioning
- Well-structured text indexes for bilingual search
- Specific indexes for category filtering
- Separation of concerns: metadata in DB, files in filesystem


### 6. Error Handling

**Current Implementation:**
- Global error handler
- Custom ApiError class
- Basic but functional
- Production improvements needed:
  - JSON log with more metadata
  - Error monitoring service integration
  - Error aggregation
  - Alert system

### 7. State Management

**Current Implementation:**
- React Context for auth
- Local state for forms
- Simple loading states



## Security Corner cutting
1. Basic file validation
2. No rate limiting
3. No input sanitization middleware
4. No audit logging

## Monitoring & Observability

### Improvements Area:
1. Centralized logging
2. Performance monitoring
3. User activity tracking
4. System health dashboard


This trade-off was intentional for the assessment context but would need significant enhancements for a production environment.