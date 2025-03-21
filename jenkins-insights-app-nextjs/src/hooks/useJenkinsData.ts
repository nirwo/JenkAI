'use client';

import React, { useEffect, useState } from 'react';
import { useJenkins } from '@/lib/jenkins-context';
import axios from 'axios';

// Custom hook for fetching Jenkins jobs
export const useJenkinsJobs = () => {
  const { activeConnection, client } = useJenkins();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!activeConnection) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.post('/api/jenkins/jobs', {
          connection: activeConnection
        });
        
        if (response.data.success) {
          setJobs(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching jobs');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
  }, [activeConnection]);
  
  return { jobs, isLoading, error };
};

// Custom hook for fetching job details
export const useJobDetails = (jobName) => {
  const { activeConnection } = useJenkins();
  const [jobDetails, setJobDetails] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!activeConnection || !jobName) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.post('/api/jenkins/job-details', {
          connection: activeConnection,
          jobName
        });
        
        if (response.data.success) {
          setJobDetails(response.data.data.jobDetails);
          setBuilds(response.data.data.builds);
        } else {
          setError(response.data.error || 'Failed to fetch job details');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching job details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [activeConnection, jobName]);
  
  return { jobDetails, builds, isLoading, error };
};

// Custom hook for fetching system data
export const useSystemData = () => {
  const { activeConnection } = useJenkins();
  const [systemData, setSystemData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      if (!activeConnection) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.post('/api/jenkins/system-data', {
          connection: activeConnection
        });
        
        if (response.data.success) {
          setSystemData(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch system data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching system data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSystemData();
  }, [activeConnection]);
  
  return { systemData, isLoading, error };
};

// Custom hook for fetching console output
export const useConsoleOutput = (jobName, buildNumber) => {
  const { activeConnection } = useJenkins();
  const [consoleOutput, setConsoleOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsoleOutput = async () => {
      if (!activeConnection || !jobName || !buildNumber) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.post('/api/jenkins/console-output', {
          connection: activeConnection,
          jobName,
          buildNumber
        });
        
        if (response.data.success) {
          setConsoleOutput(response.data.data.consoleOutput);
          setErrors(response.data.data.errors);
        } else {
          setError(response.data.error || 'Failed to fetch console output');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching console output');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConsoleOutput();
  }, [activeConnection, jobName, buildNumber]);
  
  return { consoleOutput, errors, isLoading, error };
};

// Custom hook for analyzing issues
export const useIssueAnalysis = () => {
  const { activeConnection } = useJenkins();
  const [issues, setIssues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeIssues = async () => {
    if (!activeConnection) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/jenkins/analyze-issues', {
        connection: activeConnection
      });
      
      if (response.data.success) {
        setIssues(response.data.data.issues);
        setSummary(response.data.data.summary);
      } else {
        setError(response.data.error || 'Failed to analyze issues');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing issues');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeConnection) {
      analyzeIssues();
    }
  }, [activeConnection]);
  
  return { issues, summary, isLoading, error, refreshAnalysis: analyzeIssues };
};
