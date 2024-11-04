// HomePage.js

import React, { useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [patentId, setPatentId] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare the data to send
    const data = {
      patent_id: patentId,
      company: company,
    };

    try {
      // Send a POST request to the backend
      const response = await axios.post('/api/check-patent-infringement/', data);
      console.log('Response:', response.data);
      // Handle the response or update the UI as needed
      alert('Request sent successfully!');
    } catch (error) {
      console.error('Error sending data:', error);
      alert('There was an error sending the request.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <h2>Patent Infringement Checker</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Patent ID:</label>
          <input
            type="text"
            value={patentId}
            onChange={(e) => setPatentId(e.target.value)}
            placeholder="Enter Patent ID"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Company:</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter Company Name"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default HomePage;
