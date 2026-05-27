import React, { useState } from 'react';
import './Shared.css';

export default function DeveloperIntegrations() {
  // State for generated API keys and webhook URLs
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);

  // Generate a random API key (simulated) and add to list
  const generateKey = () => {
    const newKey = Math.random().toString(36).substring(2, 14).toUpperCase();
    setApiKeys(prev => [...prev, newKey]);
  };

  // Prompt user for a webhook URL and add to list if provided
  const addWebhook = () => {
    const url = prompt('Enter webhook URL');
    if (url) {
      setWebhooks(prev => [...prev, url]);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Developer & Integrations</h2>
          <p className="page-sub">Manage API keys, webhooks, and integration settings for your tenants.</p>
        </div>
      </div>
      <div className="card card-pad">
        <h3>API Keys</h3>
        <p>Generate and revoke API keys for your applications.</p>
        <ul>{apiKeys.map((key, index) => (
          <li key={index}>{key}</li>
        ))}</ul>
        <button className="btn btn-primary" style={{ marginTop: '10px' }} onClick={generateKey}>Generate New Key</button>
        <h3 style={{ marginTop: '20px' }}>Webhooks</h3>
        <p>Configure webhook endpoints to receive real-time notifications.</p>
        <ul>{webhooks.map((url, index) => (
          <li key={index}>{url}</li>
        ))}</ul>
        <button className="btn btn-secondary" style={{ marginTop: '10px' }} onClick={addWebhook}>Add Webhook</button>
      </div>
    </div>
  );
}
