Todo - separation file upload service and dataset service

# Dataset Publishing Platform Backend

This is the backend for the Dataset Publishing Platform, built with Express.js, TypeScript, routing-controllers, and MongoDB.

## Features

- File upload and processing (CSV, Excel)
- Dataset metadata extraction
- Dataset management (CRUD operations) with pagination
- Error handling
- Comprehensive logging system
- Automated bilingual metadata generation (English/Arabic)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)

## Setup

1. Clone the repository
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dataset-platform
NODE_ENV=development
# Log levels: error, warn, info, http, debug (from least to most verbose)
LOG_LEVEL=debug
```

4. Start the development server:

```bash
npm run dev
```

## Logging Configuration

The application uses Winston for logging with the following features:

- **Log Levels**: error, warn, info, http, debug (from least to most verbose)
- **Environment Variable**: Set `LOG_LEVEL` in the `.env` file to control verbosity
- **Log Files**: 
  - `logs/error.log`: Contains only error-level logs
  - `logs/combined.log`: Contains all logs
- **Console Output**: Colorized logs in the console for better readability

### Changing Log Level

You can change the log level using the provided script:

```bash
# Set log level to error (minimal logging)
npm run set-log-level error

# Set log level to info (standard logging)
npm run set-log-level info

# Set log level to debug (verbose logging)
npm run set-log-level debug
```

After changing the log level, restart the server for the changes to take effect.

## API Endpoints

### Dataset Management

- `POST /v1/datasets/upload` - Upload a new dataset file
- `GET /v1/datasets` - Get all datasets with pagination
  - Query parameters:
    - `page` (optional): Page number (default: 1)
    - `limit` (optional): Items per page (default: 10, max: 100)
  - Response includes pagination metadata:
    ```json
    {
      "success": true,
      "data": {
        "datasets": [...],
        "pagination": {
          "total": 42,
          "page": 1,
          "limit": 10,
          "pages": 5
        }
      },
      "message": "Datasets retrieved successfully"
    }
    ```
- `GET /v1/datasets/:id` - Get dataset by ID
- `DELETE /v1/datasets/:id` - Delete dataset by ID

### Other

- `GET /v1/hello` - Test endpoint

## Project Structure

- `src/app.ts` - Main application entry point
- `src/controllers/` - API controllers
- `src/services/` - Business logic
- `src/models/` - MongoDB schemas
- `src/middlewares/` - Express middlewares
- `src/utils/` - Utility functions
- `src/config/` - Configuration files

## Metadata Generation System

The platform implements an asynchronous metadata generation system using Azure OpenAI. Here's how it works:

### Current Implementation

1. **Upload Flow**:
   - User uploads a dataset file
   - System processes and validates the file
   - File is saved with status "PROCESSED"
   - Metadata generation is triggered asynchronously
   - Status updates to "METADATA_GENERATED" or "METADATA_FAILED"

2. **Metadata Generation**:
   - Uses Azure OpenAI to analyze dataset content
   - Generates bilingual metadata (English/Arabic)
   - Includes titles, descriptions, tags, and categories
   - Processes column names and sample values for context

3. **Status Tracking**:
   - UPLOADED: Initial file upload
   - PROCESSED: File validated and saved
   - METADATA_GENERATED: AI generation successful
   - METADATA_FAILED: AI generation failed
   - UNDER_REVIEW: Pending human review
   - PUBLISHED: Dataset publicly available

### Alternative Approaches (Not Implemented)

1. **Queue-Based System**:
   - Using message queues (e.g., Bull, RabbitMQ)
   - Better handling of high load
   - Retry mechanisms
   - Job prioritization
   - Progress tracking
   - Dashboard for monitoring

2. **Webhook System**:
   - Separate metadata generation service
   - Callback URLs for status updates
   - Better service isolation
   - Independent scaling
   - Cross-service communication

3. **Batch Processing**:
   - Cron jobs for periodic processing
   - Batch multiple datasets
   - Resource optimization
   - Scheduled processing windows

Current implementation chose simplicity and immediate feedback over complex architectures. For production at scale, consider implementing a queue-based system with proper retry mechanisms and monitoring.

## Error Handling

The application uses a global error handler middleware to catch and format all errors. Custom errors are defined in `src/utils/ApiError.ts`. 

## Validation

The application uses class-validator and class-transformer for request validation:

- DTOs (Data Transfer Objects) define the expected shape of request data
- Validation rules are defined using decorators
- Automatic validation is performed by routing-controllers
- Validation errors are returned with appropriate HTTP status codes

Example DTO for pagination:

```typescript
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 10;
}
``` 