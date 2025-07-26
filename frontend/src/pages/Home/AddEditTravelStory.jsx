import React, { useState, useEffect } from 'react';
import { uploadImage } from '../../api/cloudinary';
import { addStory, updateStory } from '../../api/db';

const AddEditTravelStory = ({
  storyInfo = {},
  type = 'add',
  onClose,
  fetchStories,
  userId
}) => {
  const [formData, setFormData] = useState({
    title: storyInfo.title || '',
    story: storyInfo.story || '',
    visitedLocation: storyInfo.visitedLocation || '',
    visitedDate: storyInfo.visitedDate ? new Date(storyInfo.visitedDate).toISOString().substr(0, 10) : '',
    image: null,
    imageUrl: storyInfo.imageUrl || '',
  });
  const [error, setError] = useState('');
  useEffect(() => {
    if (type === 'edit' && storyInfo) {
      setFormData((prev) => ({
        ...prev,
        title: storyInfo.title || '',
        story: storyInfo.story || '',
        visitedLocation: storyInfo.visitedLocation || '',
        visitedDate: storyInfo.visitedDate ? new Date(storyInfo.visitedDate).toISOString().substr(0, 10) : '',
        imageUrl: storyInfo.imageUrl || '',
      }));
    }
  }, [storyInfo, type]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let imageUrl = formData.imageUrl;
    if (formData.image) {
      try {
        imageUrl = await uploadImage(formData.image);
      } catch {
        setError('Image upload failed');
        return;
      }
    }
    const storyData = {
      title: formData.title,
      story: formData.story,
      visitedLocation: formData.visitedLocation,
      visitedDate: formData.visitedDate ? new Date(formData.visitedDate).getTime() : Date.now(),
      imageUrl,
      userId,
    };
    try {
      if (type === 'add') {
        await addStory(storyData);
      } else {
        await updateStory(storyInfo.id, storyData);
      }
      fetchStories && fetchStories();
      onClose && onClose();
    } catch (err) {
      setError('Failed to save story. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-xl mt-8">
      <h2 className="text-2xl font-semibold mb-4">{type === 'add' ? 'Add a Travel Story' : 'Edit Travel Story'}</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded-md"
          required
        />
        <textarea
          name="story"
          value={formData.story}
          onChange={handleChange}
          placeholder="Your Story"
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="visitedLocation"
          value={formData.visitedLocation}
          onChange={handleChange}
          placeholder="Visited Location"
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="date"
          name="visitedDate"
          value={formData.visitedDate}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          accept="image/*"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          {type === 'add' ? 'Post Story' : 'Update Story'}
        </button>
      </form>
      <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">Cancel</button>
    </div>
  );
};

export default AddEditTravelStory;