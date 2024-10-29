# HomeWorth-Melbourne🏠

This project is a full-stack application for predicting house prices in Melbourne based on various property features. The project includes a machine learning backend using FastAPI and a frontend built with Next.js and ShadCN UI components.

## Project Structure

```
homeworth-melbourne/ 
├── backend/ # Backend (FastAPI, ML model, CORS)
├── frontend/ # Frontend (Next.js, ShadCN UI)
├── LICENSE # License information
└── README.md # Project documentation 
```

## Prerequisites

- **Python 3.8+** for the backend
- **Node.js v14+** for the frontend

## Installation and Setup

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
    ```
2. **Install the dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3. **Train the model and start the FastAPI server**:
    ```bash
    python main.py
    ```
4. **Verify the server**:

    The FastAPI server should now be running on http://localhost:8000.

### Frontend Setup

Follow these steps to set up and run the frontend application.

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
    ```
2. **Install the dependencies**:
    ```bash
    npm install
    ```
3. **Start the Next.js development server**:
    ```bash
    npm run dev
    ```

    The server should now be running on http://localhost:3000.


With this setup, the frontend application is configured to connect to the backend API and can be accessed and tested locally.

## License
This project is licensed under the MIT License.
