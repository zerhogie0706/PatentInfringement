// HomePage.js

import React, { useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [patentId, setPatentId] = useState('');
  const [company, setCompany] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResponseData(null);
    setError(null);

    // Prepare the data to send
    const data = {
      patent_id: patentId,
      company: company,
    };

    try {
      // Send a POST request to the backend
      const response = await axios.post('/api/check-patent-infringement/', data);
      setResponseData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(error.response.data.msg);
        setError(error.response.data.msg || 'Invalid request. Please check your input.');
      } else {
        setError('An error occurred while processing your request.');
      }
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
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
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {responseData && !error && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>Analysis Report</h3>
          <p><strong>Company:</strong> {responseData.company}</p>
          <p><strong>Patent ID:</strong> {responseData.patent_id}</p>
          <p><strong>Analysis Date:</strong> {responseData.analysis_date}</p>

          {responseData.data.map((item, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h4>Product: {item.product}</h4>
              <p><strong>Confidence Level:</strong> {item.confidence_level}</p>
              <p><strong>Relevant Claims:</strong> {item.claims.join(', ')}</p>
              <p><strong>Summary:</strong> {item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
