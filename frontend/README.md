# HomeWorth-Melbourne - Frontend

This project provides a user-friendly web interface for predicting house prices based on various property details using a Next.js frontend with ShadCN UI components. The frontend allows users to input property information and receive an estimated price, with a comparison to similar properties.

## Project Structure

```
frontend/
├── .next/
├── lib/
├── node_modules/
├── public/
│   ├── favicon.ico
├── src/
│   ├── app/
│   │   ├── fonts/
│   │   └── results/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── charts/
│   │   │   └── PriceComparisonChart.tsx
│   │   ├── form/
│   │   │   └── PricePredictorForm.tsx
│   │   └── ui/
│   ├── data/
│   ├── lib/
│   ├── types/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .eslintrc.json
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tailwind.config.ts
```


## Prerequisites

- **Node.js** v14 or higher
- **Next.js** (React framework)
- **ShadCN UI components**

## Installation

1. **Traverse to frontend directory**:
    ```bash
    cd frontend
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Run the development server**:
    ```bash
    npm run dev
    ```

   The app will be accessible at `http://localhost:3000`.

## Data Flow and API Integration

The frontend collects user inputs, which include the number of rooms, bathrooms, land size, and other housing attributes, to predict the property price. This information is then sent to a FastAPI server (running at `http://localhost:8000`) via a `POST` request to `/predict`.

- The prediction result is displayed in the **PriceComparisonChart** component as a bar chart, where users can see the comparison between their property and similar properties in terms of estimated price.

## UI Components

### Price Prediction Form (PricePredictorForm.tsx)

The main form allows users to enter details about the property they want to evaluate, such as:

- **Suburb** selection from a searchable dropdown
- **Distance**, **Rooms**, **Bedrooms**, **Bathrooms**, **Car spaces**
- **Land Size** and **Building Area**
- **Year Built**, **Property Type**, and **Sale Method**

Example input for suburb selection:

```typescript
const handleSuburbChange = (value: string) => {
    const selectedSuburb = suburbData.find(s => s.Suburb === value);
    if (selectedSuburb) {
      setFormData(prev => ({
        ...prev,
        Suburb: value,
        Distance: selectedSuburb.Distance.toString(),
        Postcode: selectedSuburb.Postcode.toString(),
        Propertycount: selectedSuburb.Propertycount.toString(),
        Regionname: selectedSuburb.Regionname,
        CouncilArea: selectedSuburb.Suburb
      }));
    }
};
```

Once the form is submitted, it sends the input data to the FastAPI server to receive predictions and comparison data for similar properties.

### Price Comparison Chart (PriceComparisonChart.tsx)

The `PriceComparisonChart` component provides a visual comparison of the predicted house price with prices in similar suburbs. Built with the `recharts` library, it displays a bar chart where each bar represents a suburb and its predicted price. This chart allows users to see how the selected suburb's estimated price compares with nearby suburbs.

#### Key Features

- **Display Options**: Users can choose the number of suburbs to compare and sort the data by price, suburb name, or by the difference in price from the selected suburb.
- **Responsive Layout**: The chart is responsive, adjusting its height based on the number of suburbs displayed.
- **Visual Indicators**: Color-coded bars indicate whether the selected suburb's price is higher or lower than nearby suburbs.

#### Main Props

- `similarSuburbPrices`: An array of suburb data, where each item includes:
  - `suburb` - Name of the suburb.
  - `price` - Predicted price for that suburb.
  - `isSelected` - Boolean indicating if this suburb is the user's selected suburb.

#### Additional Functionalities

- **Sorting Options**: Allows users to sort by different criteria, enhancing the visualization's flexibility.

- **Dynamic Display Count**: Users can control the number of suburbs shown in the comparison, with an option to display all or a limited set.

- **Visual Comparison**: The chart provides a clear visual comparison of property prices in different suburbs, helping users make more informed decisions.

The `PriceComparisonChart` component is designed for integration with the `PricePredictorForm`, enabling users to see both the predicted price and its comparison in the same interface.

### Dependencies

The frontend project uses several libraries and tools to create a dynamic and responsive UI. Below is a list of the key dependencies:

- **Next.js**: The primary framework for building the React-based frontend.
- **React**: A JavaScript library for building user interfaces.
- **ShadCN UI Components**: A collection of customizable, accessible components for Next.js applications.
- **@radix-ui/react**: Provides accessible UI primitives like dialogs, popovers, and select menus.
- **lucide-react**: Icon library for adding visual indicators and enhancing user experience.
- **recharts**: A charting library used to create responsive and customizable bar charts for price comparison.
- **clsx**: Utility for conditionally joining class names.
- **tailwindcss**: Utility-first CSS framework for styling the components.
- **tailwind-merge**: Helper to merge Tailwind classes dynamically.

You can install all dependencies via the `package.json` file or manually using the following command:

```bash
npm install @headlessui/react @heroicons/react @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-select clsx next react react-dom recharts tailwindcss tailwind-merge
```
#### Development Dependencies

- **TypeScript**: Adds static typing to JavaScript, providing a better developer experience with type checking.
- **eslint**: A linter tool for identifying and reporting on patterns in JavaScript, helping maintain code quality.
- **postcss**: Tool for transforming CSS with plugins, necessary for setting up Tailwind CSS with Next.js.

Install development dependencies using:
```bash
npm install -D typescript eslint postcss
```
These dependencies ensure a smooth development experience and help in creating a robust, scalable frontend application.

### CORS Configuration

Ensure CORS (Cross-Origin Resource Sharing) is enabled on the FastAPI server to allow requests from the Next.js frontend hosted at `http://localhost:3000`. This configuration allows the frontend to interact with the backend API without encountering cross-origin issues.

Add the following code to the FastAPI server to enable CORS:

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
