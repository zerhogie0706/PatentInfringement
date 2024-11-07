// HomePage.js

import React, { useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [patentId, setPatentId] = useState('');
  const [company, setCompany] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingSavedReports, setLoadingSavedReports] = useState(false);
  const [loadingReportDetails, setLoadingReportDetails] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadingSubmit(true);
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
      setLoadingSubmit(false); // Stop loading state
    }
  };

  const handleSave = async () => {
    if (responseData) {
      try {
        const response = await axios.post('/api/save-data/', responseData, {
          headers: { 'Content-Type': 'application/json' },
        });
        
        // Show the returned filename to the user
        const filename = response.data.filename;
        alert(`Results have been saved successfully as ${filename}!`);
        
      } catch (error) {
        console.error('Error saving data:', error);
        alert('An error occurred while saving the results.');
      }
    }
  };

  const handleSavedResults = async () => {
    setLoadingSavedReports(true);
    setError(null);

    try {
      const response = await axios.get('/api/saved-reports/');
      setSavedReports(response.data);
    } catch (error) {
      setError('Failed to retrieve saved reports.');
    } finally {
      setLoadingSavedReports(false);
    }
  };

  const handleReportClick = async (reportId) => {
    setLoadingReportDetails(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:8000/api/report/${reportId}/`);
      setSelectedReport(response.data);
    } catch (error) {
      setError('Failed to retrieve report details.');
    } finally {
      setLoadingReportDetails(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <h2>Patent Infringement Checker</h2>

      {/* Saved Results Button */}
      {/* <button
        onClick={handleSavedResults}
        disabled={loadingSavedReports}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loadingSavedReports ? 'Loading Saved Results...' : 'Saved Results'}
      </button> */}

      {/* Display list of saved reports */}
      {!loadingSavedReports && savedReports.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>Saved Reports</h3>
          <ul>
            {savedReports.map((report) => (
              <li key={report.id} style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => handleReportClick(report.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#F0F0F0',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                  }}
                >
                  {report.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display selected report details */}
      {selectedReport && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>Report Details</h3>
          <p><strong>ID:</strong> {selectedReport.id}</p>
          <p><strong>Name:</strong> {selectedReport.name}</p>
          <p><strong>Content:</strong> {selectedReport.content}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {(loadingSubmit || loadingReportDetails) && <p>Loading...</p>}

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
          disabled={loadingSubmit}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loadingSubmit ? 'Processing...' : 'Submit'}
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

          {responseData && responseData.data && responseData.data.length > 0 && !error && (
            <div style={{ marginTop: '20px' }}>
              {/* Save Button */}
              <button
                onClick={handleSave}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save Results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
