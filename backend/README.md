# Dataset Publishing Platform Backend

Backend service for the Dataset Publishing Platform, built with Express.js, TypeScript, and MongoDB with SOLID pattern. and Jest for testing tool.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB 

## Installation

1. Clone the repository
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dataset-platform
NODE_ENV=development
LOG_LEVEL=debug
```

4. Start the development server:

```bash
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port number | 3000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/dataset-platform |
| NODE_ENV | Environment (development/production) | development |
| LOG_LEVEL | Logging level (error/warn/info/http/debug) | debug |

## API Endpoints

All endpoints are prefixed with `/v1/datasets`

### Upload Dataset
- **POST** `/upload`
- **Description**: Upload a new dataset file (CSV or Excel)
- **Request**:
  - Content-Type: `multipart/form-data`
  - Body:
    - `file`: Dataset file (required)
- **Response**: Dataset object with processing status

### List Datasets
- **GET** `/`
- **Description**: Get paginated list of datasets with search and filtering
- **Query Parameters**:
  - `page` (optional): Page number (default: 1, min: 1)
  - `limit` (optional): Items per page (default: 10, min: 1, max: 100)
  - `search` (optional): Search term for dataset metadata
  - `categories` (optional): Array of categories to filter by (comma-separated)
- **Response**: 
  ```json
  {
    "data": {
      "datasets": [...],
      "pagination": {
        "total": number,
        "page": number,
        "limit": number,
        "pages": number
      }
    }
  }
  ```

### Get Dataset Filters
- **GET** `/filters`
- **Description**: Get available filter options for datasets
- **Response**: Object containing available filter values

### Get Dataset
- **GET** `/:id`
- **Description**: Get dataset by ID
- **Response**: Single dataset object

### Update Dataset Metadata
- **PUT** `/:id/metadata`
- **Description**: Update dataset metadata
- **Request Body**:
  ```typescript
  {
    title_en?: string;     
    title_ar?: string;     
    description_en?: string;
    description_ar?: string;
    tags?: string[];       
    category_en?: string;  
    category_ar?: string;  
    subcategory_en?: string;
    subcategory_ar?: string;
    status?: "under_review" | "approved" | "changes_requested";
    role: "editor" | "admin" | "ai";
    comment?: string;
  }
  ```
- **Response**: Updated dataset object

### Upload New Version
- **POST** `/:id/version`
- **Description**: Upload a new version of an existing dataset
- **Request**:
  - Content-Type: `multipart/form-data`
  - Body:
    - `file`: Dataset file (required)
- **Response**: Updated dataset object with new version information

### Delete Dataset
- **DELETE** `/v1/datasets/:id`