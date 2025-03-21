'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Form, InputGroup, Pagination } from 'react-bootstrap';
import { useJenkins } from '@/lib/jenkins-context';
import { useJenkinsJobs } from '@/hooks/useJenkinsData';
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

export default function Jobs() {
  const { activeConnection } = useJenkins();
  const { jobs, isLoading, error } = useJenkinsJobs();
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter jobs based on search term and status filter
  const filteredJobs = jobs ? jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'success') return matchesSearch && (job.color === 'blue' || job.color?.startsWith('blue_'));
    if (statusFilter === 'failed') return matchesSearch && (job.color === 'red' || job.color?.startsWith('red_'));
    if (statusFilter === 'unstable') return matchesSearch && (job.color === 'yellow' || job.color?.startsWith('yellow_'));
    if (statusFilter === 'disabled') return matchesSearch && job.color === 'disabled';
    if (statusFilter === 'running') return matchesSearch && job.color?.includes('_anime');
    
    return matchesSearch;
  }) : [];
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }
  
  if (!activeConnection) {
    return (
      <Layout>
        <Alert variant="info">
          <Alert.Heading>No Jenkins Connection</Alert.Heading>
          <p>
            Please configure a Jenkins connection in the settings to view jobs.
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
        <h2>Jobs</h2>
        <div>
          <span className="me-2">Connected to:</span>
          <Badge bg="primary">{activeConnection.name}</Badge>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading Jenkins jobs...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : (
        <>
          {/* Filters */}
          <Card className="mb-4">
            <Card.Body>
              <div className="row">
                <div className="col-md-6 mb-3 mb-md-0">
                  <InputGroup>
                    <Form.Control
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="bi bi-x"></i> Clear
                      </Button>
                    )}
                  </InputGroup>
                </div>
                <div className="col-md-3 mb-3 mb-md-0">
                  <Form.Select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="unstable">Unstable</option>
                    <option value="running">Running</option>
                    <option value="disabled">Disabled</option>
                  </Form.Select>
                </div>
                <div className="col-md-3">
                  <Form.Select 
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                  </Form.Select>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Jobs Table */}
          <Card className="mb-4">
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Status</th>
                    <th>Last Build</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.length > 0 ? (
                    currentJobs.map((job, index) => (
                      <tr key={index}>
                        <td>{job.name}</td>
                        <td><BuildStatusBadge status={job.color} /></td>
                        <td>{job.lastBuild ? `#${job.lastBuild.number}` : 'N/A'}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            href={`/jobs/${encodeURIComponent(job.name)}`}
                          >
                            <i className="bi bi-eye"></i> View Details
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => window.open(job.url, '_blank')}
                          >
                            <i className="bi bi-box-arrow-up-right"></i> Open in Jenkins
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">
                        {filteredJobs.length === 0 ? 'No jobs match your filters' : 'No jobs found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {/* Pagination */}
              {filteredJobs.length > itemsPerPage && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)} 
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    
                    {paginationItems}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
              
              <div className="mt-3 text-muted text-center">
                Showing {currentJobs.length} of {filteredJobs.length} jobs
                {searchTerm && ` (filtered from ${jobs ? jobs.length : 0} total)`}
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Layout>
  );
}
