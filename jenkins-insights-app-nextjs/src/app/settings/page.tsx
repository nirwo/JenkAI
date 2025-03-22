'use client';

import React, { useState } from 'react';
import { Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import { useJenkins, AuthType } from '@/lib/jenkins-context';
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
    authType: AuthType.BASIC,
    username: '',
    token: '',
    password: '',
    ssoToken: '',
    cookieAuth: false
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewConnection({
      ...newConnection,
      [name]: type === 'checkbox' ? checked : value
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
      authType: AuthType.BASIC,
      username: '',
      token: '',
      password: '',
      ssoToken: '',
      cookieAuth: false
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

  // Helper function to check if form is valid based on auth type
  const isFormValid = () => {
    if (!newConnection.name || !newConnection.url) return false;
    
    switch (newConnection.authType) {
      case AuthType.BASIC:
        return !!newConnection.username && !!newConnection.token;
      case AuthType.TOKEN:
        return !!newConnection.token;
      case AuthType.SSO:
        return !!newConnection.ssoToken;
      case AuthType.BASIC_AUTH:
        return !!newConnection.username && !!newConnection.password;
      default:
        return false;
    }
  };

  // Helper function to get auth type label
  const getAuthTypeLabel = (authType) => {
    switch (authType) {
      case AuthType.BASIC:
        return 'Basic (Username + API Token)';
      case AuthType.TOKEN:
        return 'API Token Only';
      case AuthType.SSO:
        return 'Single Sign-On (SSO)';
      case AuthType.BASIC_AUTH:
        return 'Basic Auth (Username + Password)';
      default:
        return authType;
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
                  <th>Auth Type</th>
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
                      <td>{getAuthTypeLabel(conn.authType)}</td>
                      <td>{conn.username || '-'}</td>
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
                            <i className="bi bi-check-circle me-1"></i>
                            Set Active
                          </Button>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveConnection(conn.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">No connections configured</td>
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
              <Form.Label>Authentication Type</Form.Label>
              <Form.Select 
                name="authType"
                value={newConnection.authType}
                onChange={handleInputChange}
                required
              >
                <option value={AuthType.BASIC}>Basic (Username + API Token)</option>
                <option value={AuthType.TOKEN}>API Token Only</option>
                <option value={AuthType.SSO}>Single Sign-On (SSO)</option>
                <option value={AuthType.BASIC_AUTH}>Basic Auth (Username + Password)</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Select the authentication method used by your Jenkins instance.
              </Form.Text>
            </Form.Group>
            
            {/* Conditional fields based on auth type */}
            {(newConnection.authType === AuthType.BASIC || newConnection.authType === AuthType.BASIC_AUTH) && (
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
            )}
            
            {newConnection.authType === AuthType.BASIC && (
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
            )}
            
            {newConnection.authType === AuthType.TOKEN && (
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
            )}
            
            {newConnection.authType === AuthType.BASIC_AUTH && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  name="password"
                  value={newConnection.password}
                  onChange={handleInputChange}
                  placeholder="Jenkins Password" 
                  required
                />
              </Form.Group>
            )}
            
            {newConnection.authType === AuthType.SSO && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>SSO Token</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="ssoToken"
                    value={newConnection.ssoToken}
                    onChange={handleInputChange}
                    placeholder="SSO Token" 
                    required
                  />
                  <Form.Text className="text-muted">
                    The token provided by your SSO provider for Jenkins authentication.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="cookie-auth-switch"
                    name="cookieAuth"
                    checked={newConnection.cookieAuth}
                    onChange={handleInputChange}
                    label="Enable Cookie-based Authentication"
                  />
                  <Form.Text className="text-muted">
                    Enable this if your SSO implementation uses cookies for authentication.
                  </Form.Text>
                </Form.Group>
              </>
            )}
            
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
                disabled={testingConnection || !isFormValid()}
              >
                <i className="bi bi-lightning-charge me-1"></i>
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={!isFormValid()}
              >
                <i className="bi bi-plus-circle me-1"></i>
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
              <Form.Select defaultValue="dark">
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
              <i className="bi bi-save me-1"></i>
              Save Preferences
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Layout>
  );
}
