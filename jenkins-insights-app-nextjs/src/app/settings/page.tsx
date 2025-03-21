'use client';

import React, { useState } from 'react';
import { Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import { useJenkins } from '@/lib/jenkins-context';
import Layout from '@/components/Layout';

export default function Settings() {
  const { 
    connections, 
    activeConnection, 
    addConnection, 
    removeConnection, 
    setActiveConnection,
    testConnection,
    isLoading,
    error
  } = useJenkins();
  
  const [newConnection, setNewConnection] = useState({
    name: '',
    url: '',
    username: '',
    token: '',
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConnection({
      ...newConnection,
      [name]: value
    });
  };
  
  const handleAddConnection = async (e) => {
    e.preventDefault();
    
    // Generate ID if not provided
    const newId = Date.now().toString();
    
    addConnection({
      id: newId,
      ...newConnection
    });
    
    setNewConnection({
      name: '',
      url: '',
      username: '',
      token: '',
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const handleRemoveConnection = (id) => {
    removeConnection(id);
  };
  
  const handleSetActive = (id) => {
    setActiveConnection(id);
  };
  
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    
    try {
      const result = await testConnection({
        id: 'test',
        ...newConnection
      });
      
      setTestResult({
        success: result,
        message: result ? 'Connection successful!' : 'Connection failed. Please check your credentials and URL.'
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: `Error: ${err.message || 'An unknown error occurred'}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Layout>
      <h2 className="mb-4">Settings</h2>
      
      {showSuccess && (
        <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
          Connection added successfully!
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      
      {/* Jenkins Connections */}
      <Card className="mb-4">
        <Card.Header>Jenkins Connections</Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {connections.length > 0 ? (
                  connections.map(conn => (
                    <tr key={conn.id} className={activeConnection?.id === conn.id ? 'table-active' : ''}>
                      <td>{conn.name}</td>
                      <td>{conn.url}</td>
                      <td>{conn.username}</td>
                      <td>
                        <Badge bg={activeConnection?.id === conn.id ? 'success' : 'secondary'}>
                          {activeConnection?.id === conn.id ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        {activeConnection?.id !== conn.id && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleSetActive(conn.id)}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveConnection(conn.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">No connections configured</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
      
      {/* Add New Connection */}
      <Card className="mb-4">
        <Card.Header>Add New Connection</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddConnection}>
            <Form.Group className="mb-3">
              <Form.Label>Connection Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={newConnection.name}
                onChange={handleInputChange}
                placeholder="e.g., Production Jenkins" 
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Jenkins URL</Form.Label>
              <Form.Control 
                type="url" 
                name="url"
                value={newConnection.url}
                onChange={handleInputChange}
                placeholder="https://jenkins.example.com" 
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                name="username"
                value={newConnection.username}
                onChange={handleInputChange}
                placeholder="admin" 
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API Token</Form.Label>
              <Form.Control 
                type="password" 
                name="token"
                value={newConnection.token}
                onChange={handleInputChange}
                placeholder="Jenkins API Token" 
                required
              />
              <Form.Text className="text-muted">
                You can generate an API token from your Jenkins user configuration page.
              </Form.Text>
            </Form.Group>
            
            {testResult && (
              <Alert variant={testResult.success ? 'success' : 'danger'} className="mb-3">
                {testResult.message}
              </Alert>
            )}
            
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                type="button" 
                onClick={handleTestConnection}
                disabled={testingConnection || !newConnection.url || !newConnection.username || !newConnection.token}
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={!newConnection.name || !newConnection.url || !newConnection.username || !newConnection.token}
              >
                Add Connection
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {/* User Preferences */}
      <Card>
        <Card.Header>User Preferences</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Theme</Form.Label>
              <Form.Select defaultValue="light">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Auto-refresh Interval</Form.Label>
              <Form.Select defaultValue="5">
                <option value="0">Disabled</option>
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="notifications-switch"
                label="Enable Notifications"
                defaultChecked
              />
            </Form.Group>
            
            <Button variant="primary" type="submit">
              Save Preferences
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Layout>
  );
}
