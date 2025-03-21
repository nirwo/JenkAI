'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import Layout from '@/components/Layout';
import { useJenkins } from '@/lib/jenkins-context';

// Console Analyzer Component
const ConsoleAnalyzer = () => {
  const [consoleText, setConsoleText] = useState('');
  const [jobName, setJobName] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const { activeConnection } = useJenkins();

  const handleAnalyze = async () => {
    if (!consoleText && (!jobName || !buildNumber)) {
      setError('Please either paste console output or provide job name and build number');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Simulate analysis with common error patterns
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const errorPatterns = [
        { pattern: /error:/i, type: 'General Error', severity: 'high' },
        { pattern: /exception:/i, type: 'Exception', severity: 'high' },
        { pattern: /fatal:/i, type: 'Fatal Error', severity: 'high' },
        { pattern: /warning:/i, type: 'Warning', severity: 'medium' },
        { pattern: /failed to/i, type: 'Failure', severity: 'high' },
        { pattern: /cannot find/i, type: 'Missing Resource', severity: 'medium' },
        { pattern: /not found/i, type: 'Missing Resource', severity: 'medium' },
        { pattern: /permission denied/i, type: 'Permission Issue', severity: 'high' },
        { pattern: /timeout/i, type: 'Timeout', severity: 'medium' },
        { pattern: /out of memory/i, type: 'Resource Issue', severity: 'high' },
        { pattern: /connection refused/i, type: 'Network Issue', severity: 'high' },
        { pattern: /could not connect/i, type: 'Network Issue', severity: 'high' },
        { pattern: /compilation failed/i, type: 'Build Error', severity: 'high' },
        { pattern: /test failed/i, type: 'Test Failure', severity: 'medium' },
        { pattern: /deprecated/i, type: 'Deprecation Warning', severity: 'low' }
      ];
      
      const text = consoleText || 'Sample console output with errors and exceptions for testing';
      const lines = text.split('\n');
      
      const issues = [];
      const highlightedLines = [];
      
      lines.forEach((line, index) => {
        let hasMatch = false;
        let matchType = '';
        let matchSeverity = '';
        
        for (const pattern of errorPatterns) {
          if (pattern.pattern.test(line)) {
            hasMatch = true;
            matchType = pattern.type;
            matchSeverity = pattern.severity;
            break;
          }
        }
        
        if (hasMatch) {
          issues.push({
            lineNumber: index + 1,
            text: line,
            type: matchType,
            severity: matchSeverity
          });
          
          highlightedLines.push({
            lineNumber: index + 1,
            text: line,
            severity: matchSeverity
          });
        } else {
          highlightedLines.push({
            lineNumber: index + 1,
            text: line,
            severity: 'none'
          });
        }
      });
      
      const summary = {
        totalIssues: issues.length,
        highSeverity: issues.filter(i => i.severity === 'high').length,
        mediumSeverity: issues.filter(i => i.severity === 'medium').length,
        lowSeverity: issues.filter(i => i.severity === 'low').length,
        mostCommonType: issues.length > 0 
          ? Object.entries(
              issues.reduce((acc, issue) => {
                acc[issue.type] = (acc[issue.type] || 0) + 1;
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1])[0][0]
          : 'None'
      };
      
      setAnalysisResult({
        issues,
        highlightedLines,
        summary
      });
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleFetchConsole = async () => {
    if (!jobName || !buildNumber) {
      setError('Please provide both job name and build number');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Simulate fetching console output
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample console output with errors for testing
      const sampleConsole = `Started by user admin
Building in workspace /var/jenkins_home/workspace/test-freestyle-job
[test-freestyle-job] $ /bin/sh -xe /tmp/jenkins123456.sh
+ echo 'Running test script'
Running test script
+ npm install
npm WARN deprecated request@2.88.2: request has been deprecated
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /var/jenkins_home/workspace/test-freestyle-job/package.json
npm ERR! errno -2
npm ERR! enoent ENOENT: no such file or directory, open '/var/jenkins_home/workspace/test-freestyle-job/package.json'
npm ERR! enoent This is related to npm not being able to find a file.
npm ERR! enoent 

npm ERR! A complete log of this run can be found in:
npm ERR!     /var/jenkins_home/.npm/_logs/2023-03-21T12_00_00_000Z-debug.log
+ echo 'Running tests'
Running tests
+ npm test
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /var/jenkins_home/workspace/test-freestyle-job/package.json
npm ERR! errno -2
npm ERR! enoent ENOENT: no such file or directory, open '/var/jenkins_home/workspace/test-freestyle-job/package.json'
npm ERR! enoent This is related to npm not being able to find a file.
npm ERR! enoent 

npm ERR! A complete log of this run can be found in:
npm ERR!     /var/jenkins_home/.npm/_logs/2023-03-21T12_00_05_000Z-debug.log
Build step 'Execute shell' marked build as failure
Finished: FAILURE`;
      
      setConsoleText(sampleConsole);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching console output');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const renderHighlightedConsole = () => {
    if (!analysisResult) return null;
    
    return (
      <pre className="p-3 rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>
        {analysisResult.highlightedLines.map((line, index) => (
          <div 
            key={index}
            className={`${line.severity === 'high' ? 'bg-danger bg-opacity-25' : 
                         line.severity === 'medium' ? 'bg-warning bg-opacity-25' : 
                         line.severity === 'low' ? 'bg-info bg-opacity-25' : ''}`}
          >
            <span className="text-muted me-2">{line.lineNumber}</span>
            {line.text}
          </div>
        ))}
      </pre>
    );
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <i className="bi bi-terminal me-2"></i>
        Console Analyzer
      </Card.Header>
      <Card.Body>
        <p>
          Analyze console output from freestyle jobs to identify errors and exceptions.
        </p>
        
        <Form>
          <Row className="mb-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label>Job Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="Enter job name"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Build Number</Form.Label>
                <Form.Control 
                  type="text" 
                  value={buildNumber}
                  onChange={(e) => setBuildNumber(e.target.value)}
                  placeholder="Enter build #"
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button 
                variant="primary" 
                onClick={handleFetchConsole}
                disabled={isAnalyzing || !activeConnection}
                className="mb-3 me-2"
              >
                <i className="bi bi-cloud-download me-1"></i> Fetch Console
              </Button>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Console Output</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={10}
              value={consoleText}
              onChange={(e) => setConsoleText(e.target.value)}
              placeholder="Paste console output here or fetch from a specific build"
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!consoleText && (!jobName || !buildNumber))}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-1"></i> Analyze Console
                </>
              )}
            </Button>
          </div>
        </Form>
        
        {error && (
          <Alert variant="danger" className="mt-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}
        
        {analysisResult && (
          <div className="mt-4">
            <h4>Analysis Results</h4>
            
            <Row className="mb-3">
              <Col md={3}>
                <Card className="text-center bg-dark">
                  <Card.Body>
                    <h3>{analysisResult.summary.totalIssues}</h3>
                    <p><i className="bi bi-exclamation-circle me-1"></i> Total Issues</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center bg-dark">
                  <Card.Body>
                    <h3 className="text-danger">{analysisResult.summary.highSeverity}</h3>
                    <p><i className="bi bi-exclamation-triangle-fill me-1"></i> High Severity</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center bg-dark">
                  <Card.Body>
                    <h3 className="text-warning">{analysisResult.summary.mediumSeverity}</h3>
                    <p><i className="bi bi-exclamation-triangle me-1"></i> Medium Severity</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center bg-dark">
                  <Card.Body>
                    <h3>{analysisResult.summary.mostCommonType}</h3>
                    <p><i className="bi bi-tag me-1"></i> Most Common Issue</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Tabs defaultActiveKey="highlighted" className="mb-3">
              <Tab eventKey="highlighted" title="Highlighted Console">
                {renderHighlightedConsole()}
              </Tab>
              <Tab eventKey="issues" title="Issues List">
                {analysisResult.issues.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Line</th>
                          <th>Type</th>
                          <th>Severity</th>
                          <th>Text</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.issues.map((issue, index) => (
                          <tr key={index}>
                            <td>{issue.lineNumber}</td>
                            <td>{issue.type}</td>
                            <td>
                              <span className={`badge bg-${issue.severity === 'high' ? 'danger' : 
                                                          issue.severity === 'medium' ? 'warning' : 'info'}`}>
                                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                              </span>
                            </td>
                            <td>
                              <code>{issue.text.length > 100 ? `${issue.text.substring(0, 100)}...` : issue.text}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center">No issues found</p>
                )}
              </Tab>
              <Tab eventKey="recommendations" title="Recommendations">
                <div className="p-3">
                  {analysisResult.issues.length > 0 ? (
                    <>
                      <h5>Recommended Actions</h5>
                      <ul className="list-group">
                        {analysisResult.summary.highSeverity > 0 && (
                          <li className="list-group-item bg-dark">
                            <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                            <strong>High Severity Issues:</strong> Address {analysisResult.summary.highSeverity} critical issues immediately
                          </li>
                        )}
                        {analysisResult.issues.some(i => i.type === 'Missing Resource') && (
                          <li className="list-group-item bg-dark">
                            <i className="bi bi-file-earmark-x me-2"></i>
                            <strong>Missing Resources:</strong> Check if all required files exist in the workspace
                          </li>
                        )}
                        {analysisResult.issues.some(i => i.type === 'Permission Issue') && (
                          <li className="list-group-item bg-dark">
                            <i className="bi bi-shield-lock me-2"></i>
                            <strong>Permission Issues:</strong> Verify Jenkins has proper permissions to access resources
                          </li>
                        )}
                        {analysisResult.issues.some(i => i.type === 'Network Issue') && (
                          <li className="list-group-item bg-dark">
                            <i className="bi bi-hdd-network me-2"></i>
                            <strong>Network Issues:</strong> Check network connectivity and firewall settings
                          </li>
                        )}
                        {analysisResult.issues.some(i => i.type === 'Build Error') && (
                          <li className="list-group-item bg-dark">
                            <i className="bi bi-tools me-2"></i>
                            <strong>Build Errors:</strong> Review build configuration and dependencies
                          </li>
                        )}
                        <li className="list-group-item bg-dark">
                          <i className="bi bi-arrow-repeat me-2"></i>
                          <strong>General Recommendation:</strong> After fixing issues, trigger a new build to verify
                        </li>
                      </ul>
                    </>
                  ) : (
                    <p className="text-center">No recommendations available</p>
                  )}
                </div>
              </Tab>
            </Tabs>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// System Health Check Component
const SystemHealthCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResults, setCheckResults] = useState(null);
  const { activeConnection } = useJenkins();
  
  const handleRunCheck = async () => {
    setIsChecking(true);
    
    try {
      // Simulate system health check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCheckResults({
        executors: {
          total: 10,
          busy: 3,
          idle: 7,
          status: 'healthy'
        },
        nodes: {
          total: 3,
          online: 2,
          offline: 1,
          status: 'warning'
        },
        queue: {
          size: 2,
          blocked: 0,
          stuck: 0,
          status: 'healthy'
        },
        memory: {
          usage: 68,
          status: 'warning'
        },
        disk: {
          usage: 45,
          status: 'healthy'
        },
        plugins: {
          total: 42,
          outdated: 5,
          status: 'warning'
        }
      });
    } catch (error) {
      console.error('Error running health check:', error);
    } finally {
      setIsChecking(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <i className="bi bi-heart-pulse me-2"></i>
        System Health Check
      </Card.Header>
      <Card.Body>
        <p>
          Check the health of your Jenkins instance to identify potential system-wide issues.
        </p>
        
        <div className="d-flex justify-content-center mb-4">
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleRunCheck}
            disabled={isChecking || !activeConnection}
          >
            {isChecking ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Running Health Check...
              </>
            ) : (
              <>
                <i className="bi bi-play-circle me-2"></i> Run Health Check
              </>
            )}
          </Button>
        </div>
        
        {checkResults && (
          <>
            <Row>
              <Col md={4} className="mb-3">
                <Card className={`text-center h-100 border-${getStatusColor(checkResults.executors.status)}`}>
                  <Card.Header className={`bg-${getStatusColor(checkResults.executors.status)} bg-opacity-25`}>
                    <i className="bi bi-cpu me-2"></i>
                    Executors
                  </Card.Header>
                  <Card.Body>
                    <h3>{checkResults.executors.busy} / {checkResults.executors.total}</h3>
                    <p>Busy Executors</p>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar bg-${getStatusColor(checkResults.executors.status)}`} 
                        role="progressbar" 
                        style={{ width: `${(checkResults.executors.busy / checkResults.executors.total) * 100}%` }}
                        aria-valuenow={(checkResults.executors.busy / checkResults.executors.total) * 100} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className={`badge bg-${getStatusColor(checkResults.executors.status)}`}>
                      {checkResults.executors.status.toUpperCase()}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className={`text-center h-100 border-${getStatusColor(checkResults.nodes.status)}`}>
                  <Card.Header className={`bg-${getStatusColor(checkResults.nodes.status)} bg-opacity-25`}>
                    <i className="bi bi-hdd-network me-2"></i>
                    Nodes
                  </Card.Header>
                  <Card.Body>
                    <h3>{checkResults.nodes.online} / {checkResults.nodes.total}</h3>
                    <p>Online Nodes</p>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar bg-${getStatusColor(checkResults.nodes.status)}`} 
                        role="progressbar" 
                        style={{ width: `${(checkResults.nodes.online / checkResults.nodes.total) * 100}%` }}
                        aria-valuenow={(checkResults.nodes.online / checkResults.nodes.total) * 100} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className={`badge bg-${getStatusColor(checkResults.nodes.status)}`}>
                      {checkResults.nodes.status.toUpperCase()}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className={`text-center h-100 border-${getStatusColor(checkResults.queue.status)}`}>
                  <Card.Header className={`bg-${getStatusColor(checkResults.queue.status)} bg-opacity-25`}>
                    <i className="bi bi-list-ol me-2"></i>
                    Queue
                  </Card.Header>
                  <Card.Body>
                    <h3>{checkResults.queue.size}</h3>
                    <p>Queued Items</p>
                    <div className="mt-4 mb-2">
                      <span className="d-block mb-2">Blocked: {checkResults.queue.blocked}</span>
                      <span className="d-block">Stuck: {checkResults.queue.stuck}</span>
                    </div>
                    <span className={`badge bg-${getStatusColor(checkResults.queue.status)}`}>
                      {checkResults.queue.status.toUpperCase()}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row>
              <Col md={4} className="mb-3">
                <Card className={`text-center h-100 border-${getStatusColor(checkResults.memory.status)}`}>
                  <Card.Header className={`bg-${getStatusColor(checkResults.memory.status)} bg-opacity-25`}>
                    <i className="bi bi-memory me-2"></i>
                    Memory
                  </Card.Header>
                  <Card.Body>
                    <h3>{checkResults.memory.usage}%</h3>
                    <p>Memory Usage</p>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar bg-${getStatusColor(checkResults.memory.status)}`} 
                        role="progressbar" 
                        style={{ width: `${checkResults.memory.usage}%` }}
                        aria-valuenow={checkResults.memory.usage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className={`badge bg-${getStatusColor(checkResults.memory.status)}`}>
                      {checkResults.memory.status.toUpperCase()}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className={`text-center h-100 border-${getStatusColor(checkResults.disk.status)}`}>
                  <Card.Header className={`bg-${getStatusColor(checkResults.disk.status)} bg-opacity-25`}>
                    <i className="bi bi-hdd me-2"></i>
                    Disk
                  </Card.Header>
                  <Card.Body>
                    <h3>{checkResults.disk.usage}%</h3>
                    <p>Disk Usage</p>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar bg-${getStatusColor(checkResults.disk.status)}`} 
                        role="progressbar" 
                        style={{ width: `${checkResults.disk.usage}%` }}
                        aria-valuenow={checkResults.disk.usage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className={`badge bg-${getStatusColor(checkResults.disk.status)}`}>
                      {checkResults.disk.status.toUpperCase()}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-3">
                <Card className={`text-center h-100 border-${getStatusColor(checkResults.plugins.status)}`}>
                  <Card.Header className={`bg-${getStatusColor(checkResults.plugins.status)} bg-opacity-25`}>
                    <i className="bi bi-puzzle me-2"></i>
                    Plugins
                  </Card.Header>
                  <Card.Body>
                    <h3>{checkResults.plugins.outdated} / {checkResults.plugins.total}</h3>
                    <p>Outdated Plugins</p>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar bg-${getStatusColor(checkResults.plugins.status)}`} 
                        role="progressbar" 
                        style={{ width: `${(checkResults.plugins.outdated / checkResults.plugins.total) * 100}%` }}
                        aria-valuenow={(checkResults.plugins.outdated / checkResults.plugins.total) * 100} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className={`badge bg-${getStatusColor(checkResults.plugins.status)}`}>
                      {checkResults.plugins.status.toUpperCase()}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <div className="mt-3">
              <h5>Recommendations</h5>
              <ul className="list-group">
                {checkResults.nodes.status !== 'healthy' && (
                  <li className="list-group-item bg-dark">
                    <i className="bi bi-hdd-network-fill text-warning me-2"></i>
                    <strong>Node Issues:</strong> {checkResults.nodes.offline} node(s) are offline. Check node connectivity and agent status.
                  </li>
                )}
                {checkResults.memory.status !== 'healthy' && (
                  <li className="list-group-item bg-dark">
                    <i className="bi bi-memory text-warning me-2"></i>
                    <strong>Memory Usage:</strong> Memory usage is at {checkResults.memory.usage}%. Consider increasing available memory or optimizing Jenkins configuration.
                  </li>
                )}
                {checkResults.plugins.status !== 'healthy' && (
                  <li className="list-group-item bg-dark">
                    <i className="bi bi-puzzle text-warning me-2"></i>
                    <strong>Outdated Plugins:</strong> {checkResults.plugins.outdated} plugins are outdated. Update plugins to ensure security and compatibility.
                  </li>
                )}
                <li className="list-group-item bg-dark">
                  <i className="bi bi-arrow-repeat me-2"></i>
                  <strong>Regular Maintenance:</strong> Schedule regular health checks to proactively identify and address issues.
                </li>
              </ul>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

// Troubleshooting Wizard Component
const TroubleshootingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [solution, setSolution] = useState(null);
  const { activeConnection } = useJenkins();
  
  const handleAnswerSelect = (answer) => {
    const newAnswers = { ...answers, [currentStep]: answer };
    setAnswers(newAnswers);
    
    if (currentStep === 3) {
      // Generate solution based on answers
      generateSolution(newAnswers);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleReset = () => {
    setCurrentStep(1);
    setAnswers({});
    setSolution(null);
  };
  
  const generateSolution = (answers) => {
    // Logic to determine solution based on answers
    let solutionText = '';
    let solutionSteps = [];
    
    if (answers[1] === 'build_failure') {
      if (answers[2] === 'compilation') {
        solutionText = 'Your build is failing due to compilation errors.';
        solutionSteps = [
          'Check the console output for specific compilation errors',
          'Verify that all dependencies are correctly installed',
          'Ensure the correct JDK/compiler version is being used',
          'Fix the identified syntax or semantic errors in your code'
        ];
      } else if (answers[2] === 'test') {
        solutionText = 'Your build is failing due to test failures.';
        solutionSteps = [
          'Review the test reports to identify failing tests',
          'Run the failing tests locally to reproduce the issue',
          'Fix the code or update the tests as appropriate',
          'Consider temporarily disabling flaky tests if necessary'
        ];
      } else if (answers[2] === 'deployment') {
        solutionText = 'Your build is failing during the deployment phase.';
        solutionSteps = [
          'Check deployment credentials and permissions',
          'Verify network connectivity to deployment targets',
          'Ensure deployment scripts are correctly configured',
          'Check for disk space or resource issues on the target environment'
        ];
      }
    } else if (answers[1] === 'stuck_build') {
      solutionText = 'Your build appears to be stuck or hanging.';
      solutionSteps = [
        'Check if the build is waiting for user input',
        'Look for resource constraints (disk space, memory)',
        'Check for deadlocks or infinite loops in build scripts',
        'Verify external dependencies are available and responsive',
        'Consider aborting the build and restarting with increased logging'
      ];
    } else if (answers[1] === 'agent_offline') {
      solutionText = 'Your build agent is offline or unavailable.';
      solutionSteps = [
        'Check the agent machine for power or network issues',
        'Verify the Jenkins agent service is running',
        'Check for disk space issues on the agent',
        'Review agent logs for errors or exceptions',
        'Try restarting the agent or reconnecting it to the master'
      ];
    } else if (answers[1] === 'plugin_issue') {
      solutionText = 'You appear to be experiencing a plugin-related issue.';
      solutionSteps = [
        'Check Jenkins logs for plugin exceptions',
        'Update the problematic plugin to the latest version',
        'Verify plugin compatibility with your Jenkins version',
        'Consider disabling the plugin temporarily to isolate the issue',
        'Check the plugin\'s issue tracker for known problems'
      ];
    }
    
    // Add answer-specific recommendations
    if (answers[3] === 'freestyle') {
      solutionSteps.push('For freestyle jobs, check the shell script or command syntax');
      solutionSteps.push('Verify environment variables are correctly set in the job configuration');
    } else if (answers[3] === 'pipeline') {
      solutionSteps.push('Review your Jenkinsfile syntax for errors');
      solutionSteps.push('Use the Pipeline Syntax Generator to create correct pipeline steps');
      solutionSteps.push('Consider adding more checkpoint or stage blocks for better diagnostics');
    } else if (answers[3] === 'multibranch') {
      solutionSteps.push('Check branch indexing configuration and credentials');
      solutionSteps.push('Verify Jenkinsfile exists in all expected branches');
      solutionSteps.push('Review branch filtering settings');
    }
    
    setSolution({
      text: solutionText,
      steps: solutionSteps
    });
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h5>What type of issue are you experiencing?</h5>
            <div className="d-grid gap-2 mt-4">
              <Button variant="outline-primary" onClick={() => handleAnswerSelect('build_failure')}>
                <i className="bi bi-x-circle me-2"></i>
                Build Failure
              </Button>
              <Button variant="outline-primary" onClick={() => handleAnswerSelect('stuck_build')}>
                <i className="bi bi-hourglass-split me-2"></i>
                Stuck or Hanging Build
              </Button>
              <Button variant="outline-primary" onClick={() => handleAnswerSelect('agent_offline')}>
                <i className="bi bi-pc-display-horizontal me-2"></i>
                Agent Offline
              </Button>
              <Button variant="outline-primary" onClick={() => handleAnswerSelect('plugin_issue')}>
                <i className="bi bi-puzzle me-2"></i>
                Plugin Issue
              </Button>
            </div>
          </div>
        );
      case 2:
        if (answers[1] === 'build_failure') {
          return (
            <div>
              <h5>What phase is the build failing in?</h5>
              <div className="d-grid gap-2 mt-4">
                <Button variant="outline-primary" onClick={() => handleAnswerSelect('compilation')}>
                  <i className="bi bi-code-slash me-2"></i>
                  Compilation/Build Phase
                </Button>
                <Button variant="outline-primary" onClick={() => handleAnswerSelect('test')}>
                  <i className="bi bi-check2-square me-2"></i>
                  Test Phase
                </Button>
                <Button variant="outline-primary" onClick={() => handleAnswerSelect('deployment')}>
                  <i className="bi bi-rocket me-2"></i>
                  Deployment Phase
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <h5>How long has this issue been occurring?</h5>
              <div className="d-grid gap-2 mt-4">
                <Button variant="outline-primary" onClick={() => handleAnswerSelect('just_started')}>
                  <i className="bi bi-clock me-2"></i>
                  Just Started (First Occurrence)
                </Button>
                <Button variant="outline-primary" onClick={() => handleAnswerSelect('recent')}>
                  <i className="bi bi-calendar-event me-2"></i>
                  Recently (Last Few Days)
                </Button>
                <Button variant="outline-primary" onClick={() => handleAnswerSelect('ongoing')}>
                  <i className="bi bi-calendar3 me-2"></i>
                  Ongoing Issue (Weeks or More)
                </Button>
              </div>
            </div>
          );
        }
      case 3:
        return (
          <div>
            <h5>What type of job is affected?</h5>
            <div className="d-grid gap-2 mt-4">
              <Button variant="outline-primary" onClick={() => handleAnswerSelect('freestyle')}>
                <i className="bi bi-tools me-2"></i>
                Freestyle Job
              </Button>
              <Button variant="outline-primary" onClick={() => handleAnswerSelect('pipeline')}>
                <i className="bi bi-diagram-3 me-2"></i>
                Pipeline Job
              </Button>
              <Button variant="outline-primary" onClick={() => handleAnswerSelect('multibranch')}>
                <i className="bi bi-git me-2"></i>
                Multibranch Pipeline
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <i className="bi bi-magic me-2"></i>
        Troubleshooting Wizard
      </Card.Header>
      <Card.Body>
        <p>
          Answer a few questions to get personalized troubleshooting recommendations.
        </p>
        
        {!activeConnection ? (
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Please configure a Jenkins connection in the settings to use the troubleshooting wizard.
          </Alert>
        ) : solution ? (
          <div>
            <div className="mb-4">
              <h4><i className="bi bi-lightbulb me-2"></i>Recommended Solution</h4>
              <p className="lead">{solution.text}</p>
            </div>
            
            <h5>Steps to Resolve:</h5>
            <ol className="list-group list-group-numbered mb-4">
              {solution.steps.map((step, index) => (
                <li key={index} className="list-group-item bg-dark">
                  {step}
                </li>
              ))}
            </ol>
            
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={handleReset}>
                <i className="bi bi-arrow-repeat me-2"></i>
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="wizard-progress mb-4">
              <div className="progress">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                  aria-valuenow={(currentStep / 3) * 100} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className={currentStep >= 1 ? 'text-primary' : ''}>Issue Type</span>
                <span className={currentStep >= 2 ? 'text-primary' : ''}>Details</span>
                <span className={currentStep >= 3 ? 'text-primary' : ''}>Job Type</span>
              </div>
            </div>
            
            {renderStep()}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default function AdvancedTroubleshooting() {
  const { activeConnection } = useJenkins();
  
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-wrench-adjustable me-2"></i>Advanced Troubleshooting</h2>
        {activeConnection && (
          <div>
            <span className="me-2">Connected to:</span>
            <span className="badge bg-primary">{activeConnection.name}</span>
          </div>
        )}
      </div>
      
      {!activeConnection && (
        <Alert variant="info" className="mb-4">
          <Alert.Heading><i className="bi bi-info-circle me-2"></i>No Jenkins Connection</Alert.Heading>
          <p>
            Please configure a Jenkins connection in the settings to use the advanced troubleshooting tools.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-info" href="/settings">
              <i className="bi bi-gear me-2"></i>Go to Settings
            </Button>
          </div>
        </Alert>
      )}
      
      <ConsoleAnalyzer />
      <SystemHealthCheck />
      <TroubleshootingWizard />
    </Layout>
  );
}
