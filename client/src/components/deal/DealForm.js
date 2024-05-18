// DealForm.js
import React, { useState } from 'react';

function DealForm({ deal, onSave, onCancel }) {
  const [title, setTitle] = useState(deal.title || '');
  const [description, setDescription] = useState(deal.description || '');

  const handleSubmit = event => {
    event.preventDefault();
    onSave({ ...deal, title, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
      </label>
      <label>
        Description:
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} required />
      </label>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default DealForm;