import React from 'react';

const ViewTravelStory = ({ storyInfo, onClose }) => {
  if (!storyInfo) return null;
  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-xl mt-8">
      <img
        src={storyInfo.imageUrl}
        alt={storyInfo.title}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold">{storyInfo.title}</h3>
      <p className="text-sm text-gray-600">{storyInfo.visitedLocation}</p>
      <p className="text-sm mt-2 text-gray-800">{storyInfo.story}</p>
      <p className="text-xs text-gray-500 mt-2">
        Visited on: {storyInfo.visitedDate ? new Date(storyInfo.visitedDate).toLocaleDateString() : ''}
      </p>
      <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">Close</button>
    </div>
  );
};

export default ViewTravelStory;