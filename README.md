

## Project Functionality Brief

This project is a Freelancer Project and Payment Management API, built with Node.js, using Express for the server framework and MongoDB with Mongoose for the database management. The application handles user management, project tracking, payment integration (via Stripe), file handling, and more.

### Key Functionalities

#### User Management

- **Authentication:** Users can sign up and log in to the system. Passwords are hashed and stored securely using bcrypt for encryption. JWT (JSON Web Tokens) is used to authenticate and authorize users.
- **Roles:** Users can have different roles, such as Client , Admin  certain routes are protected based on these roles. Role-based access control is managed using roleCheck middleware.

#### Project Management

- **Create and Update Projects:** Users (specifically Clients and Admins) can create and update projects. These projects have details like project name, description, status, etc.
- **Export and Import Projects:** The API allows exporting project data in CSV format using fast-csv, as well as importing project data from a CSV file to the database with the help of multer for file handling.
- **Delete Projects:** Admins have the ability to delete projects by project ID.
- **Project Status:** The status of the project (e.g., ongoing, completed) can be updated.

#### Payment Integration

- **Stripe Integration:** Payments are managed through Stripe. When a payment is initiated, the payment details are saved in the database, and a payment intent is created on Stripe.
- **Payment Status Updates:** Payments can have statuses (Pending, Paid, Failed), and these can be updated through the API. The stripe payment ID and client secret are saved in the database to manage payment progress.
- **Payment Retrieval:** Payments can be fetched by their ID or a list of all payments can be retrieved with associated project details.

#### Email Notifications

- **Nodemailer:** Used for sending email notifications. This can be used to send alerts for successful project updates, payment receipts, or other related events.

#### Middleware

- **Authentication and Authorization:** Custom middleware such as `auth.middleware.js` ensures that users are authenticated before accessing certain routes.
- **Role-Based Access Control:** `roleCheck` middleware restricts certain routes to specific user roles, ensuring that only authorized users can access certain resources (e.g., only Admins can access all payment data or delete projects).
- **Helmet:** The application uses helmet to enhance security by setting various HTTP headers (e.g., preventing cross-site scripting, clickjacking, etc.).
- **Body Parser:** `body-parser` is used to parse incoming request bodies in a middleware, making it easier to handle data in POST requests (especially for form submissions or JSON payloads).

#### Logging

- **Morgan:** Used for logging HTTP requests, which helps with debugging and monitoring application performance during development or in production.

#### CORS (Cross-Origin Resource Sharing)

- **CORS:** Allows the application to accept requests from different domains or origins, making it easier to handle cross-origin requests when the API is consumed by other services or frontend applications hosted on different servers.

#### Environment Variables

- **dotenv:** Used to load environment variables from a `.env` file. These variables might include sensitive information like the Stripe secret key, database connection strings, or other configurations that should not be hardcoded in the application.

### Tech Stack

#### Backend

- Node.js and Express.js for the server.
- MongoDB (via Mongoose) for database storage.
- Stripe for payment processing.
- Nodemailer for email notifications.

#### Middleware

- Custom authentication, authorization, and file handling middleware.
- Helmet for security headers.
- Morgan for logging.
- CORS for cross-origin support.

#### Utilities

- bcrypt for password hashing.
- jsonwebtoken for JWT-based authentication.
- multer for file uploads.
- fast-csv for CSV export/import functionality.


4. Create a `.env` file in the root directory and add your environment variables:

    ```
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    EMAIL= your email
    EMAIL_PASSWORD= email password
    STRIPE_SECRET_KEY = your stripe key
    PORT=5000
    
    ```

## Usage

1. Start the server:

    ```bash
    npm start
    ```

2. Use a tool like Postman to interact with the API endpoints.

## API Endpoints

### Create Project

- **URL:** `/api/projects/create`
- **Method:** `POST`
- **Headers:**
    - `Content-Type: application/json`
    - `Authorization: Bearer <token>`
- **Body:**

    ```json
    {
        "title": "Autonomous Drone Delivery System",
        "description": "Designing and testing a drone system for autonomous package delivery in urban areas.",
        "deadline": "2025-08-10",
        "budget": 25000,
        "status": "Ongoing"
    }
    ```

- **Response:**

    ```json
    {
        "message": "Project created successfully",
        "project": {
            "title": "Autonomous Drone Delivery System",
            "description": "Designing and testing a drone system for autonomous package delivery in urban areas.",
            "deadline": "2025-08-10T00:00:00.000Z",
            "budget": 25000,
            "status": "Ongoing",
            "createdBy": "674c022a9419209c28883c4d",
            "_id": "674c05d8f4c16a34b99d647d",
            "createdAt": "2024-12-01T06:44:40.708Z",
            "updatedAt": "2024-12-01T06:44:40.708Z",
            "__v": 0
        }
    }
    ```

### Get All Projects

- **URL:** `/api/projects/all`
- **Method:** `GET`
- **Response:**

    ```json
    {
        "message": "Projects retrieved successfully",
        "projects": [
            {
                "_id": "674c05d8f4c16a34b99d647d",
                "title": "Autonomous Drone Delivery System",
                "description": "Designing and testing a drone system for autonomous package delivery in urban areas.",
                "deadline": "2025-08-10T00:00:00.000Z",
                "budget": 25000,
                "status": "Ongoing",
                "createdBy": "674c022a9419209c28883c4d",
                "createdAt": "2024-12-01T06:44:40.708Z",
                "updatedAt": "2024-12-01T06:44:40.708Z",
                "__v": 0
            },
            {
                "_id": "674c0590f4c16a34b99d6475",
                "title": "Interactive Museum App",
                "description": "Designing a mobile app for museums that includes interactive maps, exhibit details, and guided tours.",
                "deadline": "2025-07-01T00:00:00.000Z",
                "budget": 11000,
                "status": "Planning",
                "createdBy": "674c022a9419209c28883c4d",
                "createdAt": "2024-12-01T06:43:28.524Z",
                "updatedAt": "2024-12-01T06:43:28.524Z",
                "__v": 0
            },
            {
                "_id": "674c057ef4c16a34b99d6471",
                "title": "Renewable Energy Feasibility Study",
                "description": "Analyzing the feasibility of implementing renewable energy solutions for a large industrial complex.",
                "deadline": "2025-02-15T00:00:00.000Z",
                "budget": 6000,
                "status": "Ongoing",
                "createdBy": "674c022a9419209c28883c4d",
                "createdAt": "2024-12-01T06:43:10.250Z",
                "updatedAt": "2024-12-01T06:43:10.250Z",
                "__v": 0
            }
        ]
    }
    ```

### Update Project by ID

- **URL:** `/api/projects/update/:id`
- **Method:** `PUT`
- **Body:**

    ```json
    {
        "title": "Digital Marketing Campaign",
        "description": "Planning and execution of a targeted digital marketing campaign to increase brand visibility and sales.",
        "deadline": "2025-01-31T00:00:00.000Z",
        "budget": 4000,
        "status": "Completed"
    }
    ```

- **Response:**

    ```json
    {
        "message": "Project updated successfully.",
        "project": {
            "_id": "674c048b891f72c121d83874",
            "title": "Digital Marketing Campaign",
            "description": "Planning and execution of a targeted digital marketing campaign to increase brand visibility and sales.",
            "deadline": "2025-01-31T00:00:00.000Z",
            "budget": 4000,
            "status": "Completed",
            "createdBy": "674c022a9419209c28883c4d",
            "createdAt": "2024-12-01T06:39:07.851Z",
            "updatedAt": "2024-12-01T09:02:28.090Z",
            "__v": 0
        }
    }
    ```

### Get Project by ID

- **URL:** `/api/projects/get-by-id/:id`
- **Method:** `GET`
- **Response:**

    ```json
    {
        "message": "Project details fetched successfully.",
        "project": {
            "_id": "674c048b891f72c121d83874",
            "title": "Digital Marketing Campaign",
            "description": "Planning and execution of a targeted digital marketing campaign to increase brand visibility and sales.",
            "deadline": "2025-01-31T00:00:00.000Z",
            "budget": 4000,
            "status": "Completed",
            "createdBy": "674c022a9419209c28883c4d",
            "createdAt": "2024-12-01T06:39:07.851Z",
            "updatedAt": "2024-12-01T09:02:28.090Z",
            "__v": 0
        }
    }
    ```

### Delete Project by ID

- **URL:** `/api/projects/delete/:id`
- **Method:** `DELETE`
- **Response:**

    ```json
    {
        "message": "Project deleted successfully.",
        "project": {
            "_id": "674c046f891f72c121d8386d",
            "title": "Corporate Website Redesign",
            "description": "Revamping the existing corporate website with a modern design and improved user experience.",
            "deadline": "2024-12-15T00:00:00.000Z",
            "budget": 4500,
            "status": "Completed",
            "createdBy": "674c022a9419209c28883c4d",
            "createdAt": "2024-12-01T06:38:39.689Z",
            "updatedAt": "2024-12-01T06:38:39.689Z",
            "__v": 0
        }
    }
    ```

### Export Projects

- **URL:** `/api/projects/export`
- **Method:** `POST`
- **Brief:**
    - **Purpose:** This endpoint allows users to export project data into different formats such as CSV, JSON, or Excel. The controller will fetch project data from the database, format it, and send it back as a downloadable file or a URL to download it.
    - **Response:**

    ```json
    {
        "message": "Projects exported successfully.",
    }
   ```
### Import Projects
- **URL:** `/api/projects/import`
-  - **Method:** `POST`
-  - **Headers:**
- - `Content-Type: multipart/form-data`
 ```

```
### Payment APIs

#### Initiate Payment

- **Method:** `POST`
- **API:** `localhost:5000/api/payments/initiate`
- **Body:**

    ```json
    {
        "projectId": "674c046f891f72c121d8386d",
        "amount": 4500,
        "currency": "usd"
    }
    ```

- **Response:**

    ```json
    {
        "message": "Payment initiated successfully",
        "clientSecret": "pi_3QR8LYCDKllTQ2iB0VBmpFcg_secret_ihUb655QNlpWkEgoapSsbSAfJ",
        "payment": {
            "projectId": "674c046f891f72c121d8386d",
            "amount": 4500,
            "currency": "usd",
            "status": "Pending",
            "stripePaymentId": "pi_3QR8LYCDKllTQ2iB0VBmpFcg",
            "stripeClientSecret": "pi_3QR8LYCDKllTQ2iB0VBmpFcg_secret_ihUb655QNlpWkEgoapSsbSAfJ",
            "_id": "674c1ba4a2a4e6901045d79a",
            "createdAt": "2024-12-01T08:17:40.712Z",
            "updatedAt": "2024-12-01T08:17:40.712Z",
            "__v": 0
        }
    }
    ```

#### Get All Payments

- **Method:** `GET`
- **API:** `localhost:5000/api/payments/all`
- **Headers:**
    - `Authorization: Bearer <token>`

- **Response:**

    ```json
    {
        "message": "Payments fetched successfully",
        "payments": [
            {
                "_id": "674c1adaa2a4e6901045d790",
                "projectId": {
                    "_id": "674c05d8f4c16a34b99d647d",
                    "description": "Designing and testing a drone system for autonomous package delivery in urban areas."
                },
                "amount": 10000.5,
                "currency": "usd",
                "status": "Pending",
                "stripePaymentId": "pi_3QR8IICDKllTQ2iB1BOCLUbQ",
                "createdAt": "2024-12-01T08:14:18.818Z"
            },
            {
                "_id": "674c1b77a2a4e6901045d795",
                "projectId": {
                    "_id": "674c0548f4c16a34b99d6461",
                    "description": "Launching a blog platform focusing on health tips, recipes, and fitness advice."
                },
                "amount": 2500,
                "currency": "usd",
                "status": "Pending",
                "stripePaymentId": "pi_3QR8KpCDKllTQ2iB1mahGLoi",
                "createdAt": "2024-12-01T08:16:55.029Z"
            },
            {
                "_id": "674c1ba4a2a4e6901045d79a",
                "projectId": {
                    "_id": "674c046f891f72c121d8386d",
                    "description": "Revamping the existing corporate website with a modern design and improved user experience."
                },
                "amount": 4500,
                "currency": "usd",
                "status": "Pending",
                "stripePaymentId": "pi_3QR8LYCDKllTQ2iB0VBmpFcg",
                "createdAt": "2024-12-01T08:17:40.712Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10
        }
    }
    ```

#### Update Payment by ID

- **Method:** `PUT`
- **API:** `localhost:5000/api/payments/update`
- **Body:**

    ```json
    {
        "paymentId": "674c1adaa2a4e6901045d790",
        "status": "Paid"
    }
    ```

- **Response:**

    ```json
    {
        "message": "Payment status updated to Paid",
        "payment": {
            "_id": "674c1adaa2a4e6901045d790",
            "projectId": "674c05d8f4c16a34b99d647d",
            "amount": 10000.5,
            "currency": "usd",
            "status": "Paid",
            "stripePaymentId": "pi_3QR8IICDKllTQ2iB1BOCLUbQ",
            "stripeClientSecret": "pi_3QR8IICDKllTQ2iB1BOCLUbQ_secret_xICNY8JEKoKJ96lJ4jDoyQzlI",
            "createdAt": "2024-12-01T08:14:18.818Z",
            "updatedAt": "2024-12-01T08:14:18.818Z",
            "__v": 0
        }
    }
    ```



    

    
