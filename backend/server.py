from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
model = joblib.load('models/house_price_pipeline.joblib')

# Pydantic model for input validation
class HouseFeatures(BaseModel):
    Rooms: int
    Distance: float
    Postcode: int
    Bedroom2: int
    Bathroom: int
    Car: int
    Landsize: float
    BuildingArea: float
    YearBuilt: int
    Propertycount: int
    Type: str
    Method: str
    Regionname: str
    CouncilArea: str

@app.post("/predict")
async def predict_price(features: HouseFeatures):
    try:
        # Convert input to DataFrame
        input_data = pd.DataFrame([features.dict()])
        
        # Make prediction
        prediction = model.predict(input_data)
        
        return {"predicted_price": float(prediction[0])}
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)