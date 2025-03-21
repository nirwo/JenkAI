'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Tabs, Tab, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { useJenkins } from '@/lib/jenkins-context';
import { useJobDetails, useConsoleOutput } from '@/hooks/useJenkinsData';
import Layout from '@/components/Layout';

// Component for displaying build status
const BuildStatusBadge = ({ status }) => {
  if (!status) return <Badge bg="secondary">Unknown</Badge>;
  
  const statusMap = {
    'SUCCESS': { bg: 'success', text: 'Success' },
    'FAILURE': { bg: 'danger', text: 'Failed' },
    'UNSTABLE': { bg: 'warning', text: 'Unstable' },
    'ABORTED': { bg: 'secondary', text: 'Aborted' },
    'IN_PROGRESS': { bg: 'info', text: 'In Progress' },
    'NOT_BUILT': { bg: 'light', text: 'Not Built' },
    'blue': { bg: 'success', text: 'Success' },
    'red': { bg: 'danger', text: 'Failed' },
    'yellow': { bg: 'warning', text: 'Unstable' },
    'grey': { bg: 'secondary', text: 'Aborted' },
    'disabled': { bg: 'light', text: 'Disabled' },
    'blue_anime': { bg: 'info', text: 'Running' },
    'red_anime': { bg: 'info', text: 'Running' },
    'yellow_anime': { bg: 'info', text: 'Running' },
    'grey_anime': { bg: 'info', text: 'Running' }
  };
  
  const config = statusMap[status] || { bg: 'secondary', text: status };
  
  return <Badge bg={config.bg}>{config.text}</Badge>;
};

// Component for displaying console output with error highlighting
const ConsoleOutput = ({ jobName, buildNumber }) => {
  const { consoleOutput, errors, isLoading, error } = useConsoleOutput(jobName, buildNumber);
  
  if (isLoading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status" size="sm" />
        <span className="ms-2">Loading console output...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }
  
  if (!consoleOutput) {
    return <p>No console output available</p>;
  }
  
  // Function to highlight errors in console output
  const renderConsoleOutput = () => {
    if (!errors || errors.length === 0) {
      return <pre className="bg-dark text-light p-3 rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>{consoleOutput}</pre>;
    }
    
    // Create a map of line numbers to error types for quick lookup
    const errorLineMap = {};
    errors.forEach(err => {
      errorLineMap[err.line] = err.type;
    });
    
    // Split console output into lines and highlight error lines
    const lines = consoleOutput.split('\n');
    
    return (
      <div className="bg-dark text-light p-3 rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const errorType = errorLineMap[lineNumber];
          
          let bgColor = 'transparent';
          if (errorType) {
            switch (errorType) {
              case 'java':
              case 'memory':
                bgColor = 'rgba(220, 53, 69, 0.3)'; // danger
                break;
              case 'javascript':
              case 'python':
              case 'build':
                bgColor = 'rgba(255, 193, 7, 0.3)'; // warning
                break;
              case 'network':
              case 'permission':
                bgColor = 'rgba(13, 202, 240, 0.3)'; // info
                break;
              default:
                bgColor = 'rgba(108, 117, 125, 0.3)'; // secondary
            }
          }
          
          return (
            <div 
              key={lineNumber} 
              style={{ 
                backgroundColor: bgColor,
                padding: errorType ? '2px 5px' : '0 5px',
                borderRadius: errorType ? '3px' : '0',
                marginBottom: '2px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div>
      {errors && errors.length > 0 && (
        <Alert variant="warning" className="mb-3">
          <Alert.Heading>Detected {errors.length} potential issues in console output</Alert.Heading>
          <p>The following issues were detected in the console output:</p>
          <ul>
            {errors.slice(0, 5).map((err, index) => (
              <li key={index}>
                <strong>Line {err.line}:</strong> {err.text.substring(0, 100)}{err.text.length > 100 ? '...' : ''}
                <Badge bg="secondary" className="ms-2">{err.type}</Badge>
              </li>
            ))}
            {errors.length > 5 && <li>...and {errors.length - 5} more</li>}
          </ul>
        </Alert>
      )}
      
      {renderConsoleOutput()}
    </div>
  );
};

export default function JobDetails({ params }) {
  const jobName = decodeURIComponent(params.jobName);
  const { activeConnection } = useJenkins();
  const { jobDetails, builds, isLoading, error } = useJobDetails(jobName);
  const [selectedBuild, setSelectedBuild] = useState(null);
  
  // Set the first build as selected when data loads
  useEffect(() => {
    if (builds && builds.length > 0 && !selectedBuild) {
      setSelectedBuild(builds[0].number);
    }
  }, [builds, selectedBuild]);
  
  if (!activeConnection) {
    return (
      <Layout>
        <Alert variant="info">
          <Alert.Heading>No Jenkins Connection</Alert.Heading>
          <p>
            Please configure a Jenkins connection in the settings to view job details.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-info" href="/settings">
              Go to Settings
            </Button>
          </div>
        </Alert>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" href="/jobs" className="me-2">
            &larr; Back to Jobs
          </Button>
          <h2 className="d-inline-block">{jobName}</h2>
        </div>
        {jobDetails && (
          <BuildStatusBadge status={jobDetails.color} />
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading job details...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : (
        <>
          {/* Job Summary */}
          <Card className="mb-4">
            <Card.Header>Job Summary</Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {jobDetails?.name}</p>
                  <p><strong>URL:</strong> <a href={jobDetails?.url} target="_blank" rel="noopener noreferrer">{jobDetails?.url}</a></p>
                </div>
                <div className="col-md-6">
                  <p><strong>Last Build:</strong> {jobDetails?.lastBuild ? `#${jobDetails.lastBuild.number}` : 'N/A'}</p>
                  <p><strong>Status:</strong> <BuildStatusBadge status={jobDetails?.color} /></p>
                </div>
              </div>
              
              <div className="mt-3">
                <Button variant="primary" onClick={() => window.open(jobDetails?.url, '_blank')}>
                  View in Jenkins
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {/* Build History */}
          <Card className="mb-4">
            <Card.Header>Build History</Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Build</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {builds && builds.length > 0 ? (
                    builds.map((build, index) => (
                      <tr key={index} className={selectedBuild === build.number ? 'table-active' : ''}>
                        <td>#{build.number}</td>
                        <td><BuildStatusBadge status={build.result} /></td>
                        <td>{new Date(build.timestamp).toLocaleString()}</td>
                        <td>{Math.round(build.duration / 1000)}s</td>
                        <td>
                          <Button 
                            variant={selectedBuild === build.number ? "primary" : "outline-primary"} 
                            size="sm"
                            onClick={() => setSelectedBuild(build.number)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">No builds found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          {/* Build Details */}
          {selectedBuild && (
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Build #{selectedBuild} Details</span>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => window.open(`${jobDetails?.url}${selectedBuild}/`, '_blank')}
                  >
                    View in Jenkins
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Tabs defaultActiveKey="console" className="mb-3">
                  <Tab eventKey="console" title="Console Output">
                    <ConsoleOutput jobName={jobName} buildNumber={selectedBuild} />
                  </Tab>
                  <Tab eventKey="parameters" title="Parameters">
                    <p className="text-muted">Build parameters will be displayed here when available.</p>
                  </Tab>
                  <Tab eventKey="artifacts" title="Artifacts">
                    <p className="text-muted">Build artifacts will be displayed here when available.</p>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Layout>
  );
}
