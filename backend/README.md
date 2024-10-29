
# HomeWorth-Melbourne API

This part of the project provides a machine learning pipeline for predicting the house prices based on features such as the number of rooms, location, building area, etc. The pipeline includes data preprocessing, model training, and deployment via a FastAPI server for easy API access.

## Project Structure
```
├── data/
│ └── dataset.csv # Input dataset for model training 
├── models/ 
│ └── house_price_pipeline.joblib # Trained model pipeline saved as joblib file 
├── server.py # backend file for FastAPI server
├── requirements.txt # text file containing all necessary libraries
├── train.py # backend file for training
└── README.md # Project documentation
```

## Setup Instructions

### Prerequisites

- Python 3.8 or above
- Required Python libraries (can be installed via `requirements.txt` if available):
  - pandas
  - numpy
  - scikit-learn
  - fastapi
  - uvicorn
  - joblib

### Installing Dependencies

To install the necessary packages, run:

```bash
pip install -r requirements.txt
```
## Data Preprocessing and Model Training

1. **Data Loading:** The dataset is loaded from `data/dataset.csv`.

2. **Preprocessing:** This includes:
   - Dropping rows with missing target values (`Price`) and specified outliers.
   - Removing unnecessary columns (`Lattitude` and `Longtitude`).

3. **Feature Engineering:** The data is split into numeric and categorical features, each undergoing specific transformations:
   - **Numeric Features:**
     - Imputation using the median strategy to handle missing values.
     - Scaling with `StandardScaler` to standardize feature values.
   - **Categorical Features:**
     - Imputation using a constant strategy (filling missing values with 'missing').
     - One-hot encoding with `OneHotEncoder` to handle categorical data.

4. **Model Training:** A `VotingRegressor` model is used, combining three regressors:
   - `LinearRegression`
   - `RandomForestRegressor`
   - `GradientBoostingRegressor`

   The models are weighted as follows: `LinearRegression` (1), `RandomForestRegressor` (4), and `GradientBoostingRegressor` (2). This ensemble approach improves prediction accuracy by leveraging the strengths of each individual model.

5. **Saving the Model Pipeline:** The complete pipeline, which includes preprocessing and model training steps, is saved as `house_price_pipeline.joblib` in the `models` directory.

### Running Model Training

To start the training process, run:

```bash
python train.py
```
Upon successful training, the script will print the Mean Squared Error (MSE) of the model on the test set, and the trained pipeline will be saved.

## FastAPI Server

The FastAPI server hosts a prediction endpoint that accepts house features and returns the predicted price. This allows clients to easily access the model’s predictions through a RESTful API.

### Endpoints

- `POST /predict`: Predicts house price based on input features.
  - **Request Body**:
    ```json
    {
      "Rooms": 3,
      "Distance": 15.0,
      "Postcode": 3071,
      "Bedroom2": 2,
      "Bathroom": 1,
      "Car": 1,
      "Landsize": 200.0,
      "BuildingArea": 100.0,
      "YearBuilt": 1990,
      "Propertycount": 500,
      "Type": "h",
      "Method": "S",
      "Regionname": "Northern Metropolitan",
      "CouncilArea": "Darebin"
    }
    ```
  - **Response**:
    ```json
    {
      "predicted_price": 500000.0
    }
    ```

- `GET /health`: A simple health check endpoint to ensure the API is running correctly.
  - **Response**:
    ```json
    {
      "status": "healthy"
    }
    ```

### Running the Server

To start the FastAPI server, run:

```bash
python server.py
```
### CORS Configuration

The server is configured to allow Cross-Origin Resource Sharing (CORS) from `http://localhost:3000`. This configuration enables secure interaction between the FastAPI backend and a frontend application (e.g., a React app) hosted on a different origin, allowing requests to be sent and received seamlessly.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
### Example API Request

After starting the server, you can make predictions by sending a POST request to the /predict endpoint. Below is an example request using curl.

```bash
curl -X POST "http://localhost:8000/predict" -H "Content-Type: application/json" -d '{
    "Rooms": 3,
    "Distance": 15.0,
    "Postcode": 3071,
    "Bedroom2": 2,
    "Bathroom": 1,
    "Car": 1,
    "Landsize": 200.0,
    "BuildingArea": 100.0,
    "YearBuilt": 1990,
    "Propertycount": 500,
    "Type": "h",
    "Method": "S",
    "Regionname": "Northern Metropolitan",
    "CouncilArea": "Darebin"
}'
```

Alternatively, you can test the endpoint using tools like Postman or by integrating it into your frontend application.

## Model Performance

The model’s performance is evaluated using Mean Squared Error (MSE) on a hold-out test set. This metric provides an indication of the model’s accuracy in predicting house prices, and the value is printed in the console after training.
