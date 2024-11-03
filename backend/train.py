import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import VotingRegressor, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import joblib

# Load data
df = pd.read_csv('data/dataset.csv')

# Data cleaning and preprocessing
def preprocess_data(df):
    # Drop rows with null 'Price'
    df = df.dropna(subset=['Price'])
    
    # Drop specific outliers
    outlier_indices = [12959, 8303, 27150, 26210, 25635, 19583, 27150, 12043,
                       26210, 8251, 25717, 1004, 17472, 26210, 25839,
                       18036, 26868, 4256, 2704, 33405, 2466, 16424, 12539, 15696]
    df = df.drop(index=outlier_indices)
    
    # Drop 'Lattitude' and 'Longtitude' columns
    df = df.drop(['Lattitude', 'Longtitude'], axis=1)
    
    return df

df = preprocess_data(df)

# Define features and target
target = 'Price'
numeric_features = ['Rooms', 'Distance', 'Postcode', 'Bedroom2', 'Bathroom', 'Car', 'Landsize', 'BuildingArea', 'YearBuilt', 'Propertycount']
categorical_features = ['Type', 'Method', 'Regionname', 'CouncilArea']

X = df.drop(target, axis=1)
y = df[target]

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create preprocessing pipelines
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Create model pipeline
model = VotingRegressor([
    ('lr', LinearRegression()),
    ('rf', RandomForestRegressor(n_estimators=100, random_state=42)),
    ('gb', GradientBoostingRegressor(n_estimators=100, random_state=42))
], weights=[1, 4, 2])

full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', model)
])

# Train model
print("Training model...")
full_pipeline.fit(X_train, y_train)

# Save model
print("Saving model...")
joblib.dump(full_pipeline, 'models/house_price_pipeline.joblib')
print("Model saved successfully!")

if __name__ == "__main__":
    print("Starting model training...")