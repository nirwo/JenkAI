'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useJenkins } from '@/lib/jenkins-context';
import { useJenkinsJobs, useSystemData, useIssueAnalysis } from '@/hooks/useJenkinsData';
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

// Component for displaying system health
const SystemHealth = ({ systemData }) => {
  if (!systemData) return null;
  
  const { loadStats, executorInfo } = systemData;
  
  // Calculate executor usage
  const executors = executorInfo?.computer?.flatMap(node => node.executors) || [];
  const busyExecutors = executors.filter(exec => !exec.idle).length;
  const totalExecutors = executors.length;
  const executorUsage = totalExecutors > 0 ? (busyExecutors / totalExecutors) * 100 : 0;
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <i className="bi bi-heart-pulse me-2"></i>
        System Health
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h3>{totalExecutors}</h3>
                <p><i className="bi bi-cpu me-1"></i> Total Executors</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h3>{busyExecutors}</h3>
                <p><i className="bi bi-gear-fill me-1"></i> Busy Executors</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h3>{executorUsage.toFixed(1)}%</h3>
                <p><i className="bi bi-activity me-1"></i> Executor Usage</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <h3>{executorInfo?.computer?.filter(node => !node.offline).length || 0}</h3>
                <p><i className="bi bi-hdd-network me-1"></i> Online Nodes</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Component for displaying recent builds
const RecentBuilds = ({ jobs }) => {
  // Extract recent builds from jobs
  const recentBuilds = jobs && jobs.length > 0
    ? jobs
        .filter(job => job.lastBuild)
        .map(job => ({
          jobName: job.name,
          buildNumber: job.lastBuild.number,
          result: job.lastBuild.result || job.color,
          timestamp: job.lastBuild.timestamp,
          duration: job.lastBuild.duration,
          url: job.url
        }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 5)
    : [];
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <i className="bi bi-clock-history me-2"></i>
        Recent Builds
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Job</th>
              <th>Build</th>
              <th>Status</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentBuilds.length > 0 ? (
              recentBuilds.map((build, index) => (
                <tr key={index}>
                  <td>{build.jobName}</td>
                  <td>#{build.buildNumber}</td>
                  <td><BuildStatusBadge status={build.result} /></td>
                  <td>{build.timestamp ? new Date(build.timestamp).toLocaleString() : 'N/A'}</td>
                  <td>{build.duration ? `${Math.round(build.duration / 1000)}s` : 'N/A'}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      href={`/jobs/${encodeURIComponent(build.jobName)}`}
                    >
                      <i className="bi bi-eye"></i> View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">No recent builds found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

// Component for displaying build success rate
const BuildSuccessRate = ({ jobs }) => {
  // Calculate success rate
  const jobsWithBuilds = jobs ? jobs.filter(job => job.lastBuild) : [];
  const successfulJobs = jobsWithBuilds.filter(job => 
    job.color === 'blue' || 
    (job.lastBuild && job.lastBuild.result === 'SUCCESS')
  );
  
  const successRate = jobsWithBuilds.length > 0 
    ? (successfulJobs.length / jobsWithBuilds.length) * 100 
    : 0;
  
  // Determine status color
  let statusColor = 'success';
  if (successRate < 50) statusColor = 'danger';
  else if (successRate < 80) statusColor = 'warning';
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <i className="bi bi-graph-up me-2"></i>
        Build Success Rate
      </Card.Header>
      <Card.Body className="text-center">
        <h1 className={`text-${statusColor}`}>{successRate.toFixed(1)}%</h1>
        <p>{successfulJobs.length} successful out of {jobsWithBuilds.length} jobs with builds</p>
        <div className="progress mt-3">
          <div 
            className={`progress-bar bg-${statusColor}`} 
            role="progressbar" 
            style={{ width: `${successRate}%` }}
            aria-valuenow={successRate} 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Component for displaying detected issues
const DetectedIssues = ({ issues, summary }) => {
  return (
    <Card className="mb-4">
      <Card.Header>
        <i className="bi bi-exclamation-triangle me-2"></i>
        Detected Issues
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={4} className="mb-3">
            <Card className="text-center h-100 bg-dark">
              <Card.Body>
                <h3 className="text-danger">{summary?.buildFailures || 0}</h3>
                <p><i className="bi bi-x-circle me-1"></i> Build Failures</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="text-center h-100 bg-dark">
              <Card.Body>
                <h3 className="text-warning">{summary?.stuckBuilds || 0}</h3>
                <p><i className="bi bi-hourglass-split me-1"></i> Stuck Builds</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="text-center h-100 bg-dark">
              <Card.Body>
                <h3 className="text-info">{summary?.queueIssues || 0}</h3>
                <p><i className="bi bi-list-ol me-1"></i> Queue Issues</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {issues && issues.length > 0 ? (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Type</th>
                <th>Job</th>
                <th>Build</th>
                <th>Time</th>
                <th>Severity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.slice(0, 3).map((issue, index) => (
                <tr key={index}>
                  <td>{issue.type}</td>
                  <td>{issue.job}</td>
                  <td>{issue.build}</td>
                  <td>{issue.time}</td>
                  <td>
                    <Badge bg={issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'info'}>
                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      href={`/jobs/${encodeURIComponent(issue.job)}`}
                    >
                      <i className="bi bi-search"></i> Analyze
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center">No issues detected</p>
        )}
        
        {issues && issues.length > 3 && (
          <div className="text-center mt-2">
            <Button variant="outline-primary" size="sm" href="/troubleshooting">
              <i className="bi bi-arrow-right"></i> View All Issues
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default function Dashboard() {
  const { activeConnection } = useJenkins();
  const { jobs, isLoading: jobsLoading, error: jobsError } = useJenkinsJobs();
  const { systemData, isLoading: systemLoading, error: systemError } = useSystemData();
  const { issues, summary, isLoading: issuesLoading, error: issuesError, refreshAnalysis } = useIssueAnalysis();
  
  if (!activeConnection) {
    return (
      <Layout>
        <Alert variant="info">
          <Alert.Heading><i className="bi bi-info-circle me-2"></i>No Jenkins Connection</Alert.Heading>
          <p>
            Please configure a Jenkins connection in the settings to view dashboard data.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-info" href="/settings">
              <i className="bi bi-gear me-2"></i>Go to Settings
            </Button>
          </div>
        </Alert>
      </Layout>
    );
  }
  
  const isLoading = jobsLoading || systemLoading || issuesLoading;
  const error = jobsError || systemError || issuesError;
  
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-speedometer2 me-2"></i>Dashboard</h2>
        <div className="d-flex align-items-center">
          <span className="me-2">Connected to:</span>
          <Badge bg="primary">{activeConnection.name}</Badge>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="ms-3"
            onClick={refreshAnalysis}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading Jenkins data...</p>
        </div>
      )}
      
      {error && (
        <Alert variant="danger">
          <Alert.Heading><i className="bi bi-exclamation-triangle me-2"></i>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      
      {!isLoading && !error && (
        <>
          <Row>
            <Col lg={8}>
              <SystemHealth systemData={systemData} />
            </Col>
            <Col lg={4}>
              <BuildSuccessRate jobs={jobs} />
            </Col>
          </Row>
          
          <Row>
            <Col lg={12}>
              <DetectedIssues issues={issues} summary={summary} />
            </Col>
          </Row>
          
          <Row>
            <Col lg={12}>
              <RecentBuilds jobs={jobs} />
            </Col>
          </Row>
        </>
      )}
    </Layout>
  );
}
