Retail Price Analysis API
A backend API for managing and analyzing retail fuel price data. Supports uploading price entries, searching/filtering, analyzing product performance, and generating summary reports.

Features
Upload and store retail price data
Get current prices and product performance
Search and filter with flexible queries
Pagination support for all large data endpoints
Secure routes with authentication middleware

Setup & Run 
Prerequisites:
Node.js ≥ 16
MongoDB Atlas (or local MongoDB)


1. Installation
git clone [git repo](https://github.com/success-10/basic-test.git)
cd basic-test
npm install

2. Configure Environment Variables
Create a .env file based on .env.example:
cp .env.example .env
Add the environment variable below:
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


4. Start the Server
npm run dev
Server runs at: https://basic-test-five.vercel.app/

5. API Documentation
Postman Collection
https://documenter.getpostman.com/view/33363379/2sB34fnMMN


6. How to Test
Import the Postman collection and test each route.

Use the JWT token to access protected routes (/api/retail and /api/summary endpoints).

Test paginated endpoints using ?page=1&limit=10.

6. Design Decisions & Assumptions
Dates are formatted as July 11, 2025 to match UI display expectations.

"Performance" is computed dynamically from latest vs previous price and not stored in the DB to avoid stale data.

Pagination is implemented consistently on search and other routes to retrieve data to improve scalability.

Protect middleware is used to secure all sensitive routes.

Uploaded files can be handled via Cloudinary if needed.

7. API Query Examples
Get filtered data with pagination:

GET /api/retail/search?state=Lagos&product=Petrol&page=1&limit=10

Get product analysis with search:

GET /api/retail/search-product?search=AGO&page=1&limit=10

