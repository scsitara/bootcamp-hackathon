import React from 'react';
import './PlateView.css'; // We will create this next!

const PlateView = ({ mealData }) => {
  // 'mealData' is the list of food Kelly's API will give us.
  // If there's no data yet, we show a loading message.
  if (!mealData) return <p>Loading your perfect meal...</p>;

  return (
    <div className="plate-container">
      <h2>Your Personalized Plate</h2>
      
      {/* The Visual Plate */}
      <div className="dining-plate">
        {mealData.map((item, index) => (
          <div key={index} className={`food-item slot-${index}`}>
            <p className="food-name">{item.name}</p>
            <span className="food-stats">{item.protein}g Protein</span>
          </div>
        ))}
      </div>

      {/* Nutrition Summary */}
      <div className="nutrition-summary">
        <h3>Total Nutrition</h3>
        <p>Calories: {mealData.reduce((acc, item) => acc + item.calories, 0)}</p>
        <p>Protein: {mealData.reduce((acc, item) => acc + item.protein, 0)}g</p>
      </div>
    </div>
  );
};

export default PlateView;
