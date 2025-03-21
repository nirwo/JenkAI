'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Tabs, Tab, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useJenkins } from '@/lib/jenkins-context';
import { useSystemData, useIssueAnalysis } from '@/hooks/useJenkinsData';
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

// Component for displaying severity badge
const SeverityBadge = ({ severity }) => {
  switch(severity) {
    case 'high':
      return <Badge bg="danger">High</Badge>;
    case 'medium':
      return <Badge bg="warning">Medium</Badge>;
    case 'low':
      return <Badge bg="info">Low</Badge>;
    default:
      return <Badge bg="secondary">Unknown</Badge>;
  }
};

export default function Troubleshooting() {
  const { activeConnection } = useJenkins();
  const { systemData, isLoading: systemLoading, error: systemError } = useSystemData();
  const { issues, summary, isLoading: issuesLoading, error: issuesError, refreshAnalysis } = useIssueAnalysis();
  
  // State for filtering issues
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Filter issues based on search term, severity, and type
  const filteredIssues = issues ? issues.filter(issue => {
    const matchesSearch = 
      issue.job.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesType = typeFilter === 'all' || issue.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesSeverity && matchesType;
  }) : [];
  
  // Get unique issue types for filter dropdown
  const issueTypes = issues ? [...new Set(issues.map(issue => issue.type))] : [];
  
  if (!activeConnection) {
    return (
      <Layout>
        <Alert variant="info">
          <Alert.Heading>No Jenkins Connection</Alert.Heading>
          <p>
            Please configure a Jenkins connection in the settings to use troubleshooting features.
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
  
  const isLoading = systemLoading || issuesLoading;
  const error = systemError || issuesError;
  
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Troubleshooting</h2>
        <div>
          <Button variant="primary" onClick={refreshAnalysis} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Analyzing...
              </>
            ) : (
              'Analyze Issues'
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      
      {/* Issue Detection */}
      <Card className="mb-4">
        <Card.Header>Issue Detection</Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-3 mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-danger">{summary?.buildFailures || 0}</h3>
                  <p>Build Failures</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3 mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-warning">{summary?.stuckBuilds || 0}</h3>
                  <p>Stuck Builds</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3 mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-info">{summary?.queueIssues || 0}</h3>
                  <p>Queue Issues</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3 mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <h3 className="text-success">{systemData?.nodes?.filter(node => node.offline)?.length || 0}</h3>
                  <p>Offline Nodes</p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Issues List */}
      <Card className="mb-4">
        <Card.Header>Detected Issues</Card.Header>
        <Card.Body>
          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <InputGroup>
                <Form.Control
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <Form.Select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {issueTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </Form.Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Analyzing issues...</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Job</th>
                  <th>Build</th>
                  <th>Time</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue, index) => (
                    <tr key={index}>
                      <td>{issue.type}</td>
                      <td>{issue.job}</td>
                      <td>{issue.build}</td>
                      <td>{issue.time}</td>
                      <td><SeverityBadge severity={issue.severity} /></td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          href={`/jobs/${encodeURIComponent(issue.job)}`}
                        >
                          View Job
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      {issues && issues.length > 0 
                        ? 'No issues match your filters' 
                        : 'No issues detected'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Knowledge Base */}
      <Card>
        <Card.Header>Knowledge Base</Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="common-issues" className="mb-3">
            <Tab eventKey="common-issues" title="Common Issues">
              <div className="p-3">
                <h5>Out of Memory Errors</h5>
                <p>Jenkins may encounter OutOfMemoryError when running builds with insufficient heap space.</p>
                <p><strong>Solution:</strong> Increase Jenkins heap size by modifying JENKINS_JAVA_OPTS.</p>
                
                <hr />
                
                <h5>Stuck Builds</h5>
                <p>Builds may get stuck in the queue or execute indefinitely due to resource constraints.</p>
                <p><strong>Solution:</strong> Check executor availability and review build logs for hanging processes.</p>
                
                <hr />
                
                <h5>Pipeline Failures</h5>
                <p>Pipeline stages may fail due to script errors or environment issues.</p>
                <p><strong>Solution:</strong> Review pipeline syntax and verify environment variables and credentials.</p>
              </div>
            </Tab>
            <Tab eventKey="solutions" title="Solutions">
              <div className="p-3">
                <h5>Increasing Jenkins Heap Size</h5>
                <p>Edit your Jenkins startup script and add the following:</p>
                <pre className="bg-light p-2">JENKINS_JAVA_OPTS="-Xmx2g -Xms512m"</pre>
                
                <hr />
                
                <h5>Cleaning Up Workspace</h5>
                <p>To free up disk space, you can add this to your pipeline:</p>
                <pre className="bg-light p-2">cleanWs()</pre>
                
                <hr />
                
                <h5>Restarting Jenkins Safely</h5>
                <p>Use the "Prepare for Shutdown" option to allow running builds to complete.</p>
              </div>
            </Tab>
            <Tab eventKey="freestyle-jobs" title="Freestyle Jobs">
              <div className="p-3">
                <h5>Console Output Errors</h5>
                <p>Freestyle jobs may fail with errors in the console output that are difficult to identify.</p>
                <p><strong>Solution:</strong> Use the Job Details page to view console output with error highlighting.</p>
                
                <hr />
                
                <h5>Build Step Failures</h5>
                <p>Individual build steps in freestyle jobs may fail without clear indication.</p>
                <p><strong>Solution:</strong> Add echo commands before and after critical steps to help identify where failures occur.</p>
                
                <hr />
                
                <h5>Environment Variables</h5>
                <p>Freestyle jobs may have issues with environment variables not being set correctly.</p>
                <p><strong>Solution:</strong> Use the "Inject environment variables" plugin or add environment variable printing steps.</p>
              </div>
            </Tab>
            <Tab eventKey="faq" title="FAQ">
              <div className="p-3">
                <h5>How do I diagnose memory issues?</h5>
                <p>Use tools like VisualVM to monitor memory usage and analyze heap dumps.</p>
                
                <hr />
                
                <h5>Why are my builds queued for a long time?</h5>
                <p>This could be due to executor starvation, resource constraints, or label restrictions.</p>
                
                <hr />
                
                <h5>How can I improve build performance?</h5>
                <p>Optimize your pipeline, use parallel stages, and ensure adequate resources for your agents.</p>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Layout>
  );
}
