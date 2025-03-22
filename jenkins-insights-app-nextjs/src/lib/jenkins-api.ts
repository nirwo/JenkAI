'use client';

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export enum AuthType {
  BASIC = 'basic',
  TOKEN = 'token',
  SSO = 'sso',
  BASIC_AUTH = 'basic_auth'
}

export interface JenkinsConnection {
  id: string;
  name: string;
  url: string;
  authType: AuthType;
  username?: string;
  token?: string;
  password?: string;
  ssoToken?: string;
  cookieAuth?: boolean;
}

export interface JenkinsJob {
  name: string;
  url: string;
  color: string;
  lastBuild?: JenkinsBuild;
  healthScore?: number;
}

export interface JenkinsBuild {
  number: number;
  url: string;
  result: string;
  timestamp: number;
  duration: number;
  building: boolean;
}

export interface JenkinsNode {
  name: string;
  displayName: string;
  description: string;
  offline: boolean;
  temporarilyOffline: boolean;
  monitorData?: any;
}

export interface JenkinsQueue {
  items: JenkinsQueueItem[];
}

export interface JenkinsQueueItem {
  id: number;
  task: {
    name: string;
    url: string;
  };
  stuck: boolean;
  why: string;
  buildableStartMilliseconds: number;
}

export interface JenkinsPlugin {
  shortName: string;
  longName: string;
  version: string;
  active: boolean;
  enabled: boolean;
}

class JenkinsApiClient {
  private axios: AxiosInstance;
  private connection: JenkinsConnection;

  constructor(connection: JenkinsConnection) {
    this.connection = connection;
    
    // Create axios config based on authentication type
    const config: AxiosRequestConfig = {
      baseURL: connection.url,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Configure authentication based on the selected type
    switch (connection.authType) {
      case AuthType.BASIC:
        // Basic authentication with username and token
        if (connection.username && connection.token) {
          config.auth = {
            username: connection.username,
            password: connection.token
          };
        }
        break;
      
      case AuthType.TOKEN:
        // API token authentication
        if (connection.token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${connection.token}`
          };
        }
        break;
      
      case AuthType.SSO:
        // SSO token authentication
        if (connection.ssoToken) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${connection.ssoToken}`
          };
        }
        
        // Enable withCredentials for SSO cookie-based auth if needed
        if (connection.cookieAuth) {
          config.withCredentials = true;
        }
        break;
      
      case AuthType.BASIC_AUTH:
        // Basic authentication with username and password
        if (connection.username && connection.password) {
          config.auth = {
            username: connection.username,
            password: connection.password
          };
        }
        break;
    }
    
    // Create axios instance with the configured options
    this.axios = axios.create(config);
  }

  // Test connection to Jenkins
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axios.get('/api/json');
      return response.status === 200;
    } catch (error) {
      console.error('Error testing Jenkins connection:', error);
      return false;
    }
  }

  // Get Jenkins server information
  async getServerInfo() {
    try {
      const response = await this.axios.get('/api/json');
      return response.data;
    } catch (error) {
      console.error('Error getting Jenkins server info:', error);
      throw error;
    }
  }

  // Get all jobs
  async getJobs(): Promise<JenkinsJob[]> {
    try {
      const response = await this.axios.get('/api/json?tree=jobs[name,url,color]');
      return response.data.jobs;
    } catch (error) {
      console.error('Error getting Jenkins jobs:', error);
      throw error;
    }
  }

  // Get job details
  async getJobDetails(jobName: string): Promise<JenkinsJob> {
    try {
      const encodedJobName = encodeURIComponent(jobName);
      const response = await this.axios.get(
        `/job/${encodedJobName}/api/json?tree=name,url,color,lastBuild[number,url,result,timestamp,duration,building]`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting Jenkins job details for ${jobName}:`, error);
      throw error;
    }
  }

  // Get builds for a job
  async getBuilds(jobName: string, count: number = 10): Promise<JenkinsBuild[]> {
    try {
      const encodedJobName = encodeURIComponent(jobName);
      const response = await this.axios.get(
        `/job/${encodedJobName}/api/json?tree=builds[number,url,result,timestamp,duration,building]{0,${count}}`
      );
      return response.data.builds;
    } catch (error) {
      console.error(`Error getting builds for job ${jobName}:`, error);
      throw error;
    }
  }

  // Get build details
  async getBuildDetails(jobName: string, buildNumber: number): Promise<any> {
    try {
      const encodedJobName = encodeURIComponent(jobName);
      const response = await this.axios.get(
        `/job/${encodedJobName}/${buildNumber}/api/json`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting build details for ${jobName} #${buildNumber}:`, error);
      throw error;
    }
  }

  // Get build console output
  async getBuildConsoleOutput(jobName: string, buildNumber: number): Promise<string> {
    try {
      const encodedJobName = encodeURIComponent(jobName);
      const response = await this.axios.get(
        `/job/${encodedJobName}/${buildNumber}/consoleText`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting console output for ${jobName} #${buildNumber}:`, error);
      throw error;
    }
  }

  // Get nodes (agents)
  async getNodes(): Promise<JenkinsNode[]> {
    try {
      const response = await this.axios.get(
        '/computer/api/json?tree=computer[displayName,description,offline,temporarilyOffline,monitorData]'
      );
      return response.data.computer;
    } catch (error) {
      console.error('Error getting Jenkins nodes:', error);
      throw error;
    }
  }

  // Get queue information
  async getQueue(): Promise<JenkinsQueue> {
    try {
      const response = await this.axios.get(
        '/queue/api/json?tree=items[id,task[name,url],stuck,why,buildableStartMilliseconds]'
      );
      return response.data;
    } catch (error) {
      console.error('Error getting Jenkins queue:', error);
      throw error;
    }
  }

  // Get plugins
  async getPlugins(): Promise<JenkinsPlugin[]> {
    try {
      const response = await this.axios.get(
        '/pluginManager/api/json?tree=plugins[shortName,longName,version,active,enabled]'
      );
      return response.data.plugins;
    } catch (error) {
      console.error('Error getting Jenkins plugins:', error);
      throw error;
    }
  }

  // Trigger a build
  async triggerBuild(jobName: string, parameters: Record<string, string> = {}): Promise<void> {
    try {
      const encodedJobName = encodeURIComponent(jobName);
      
      // Check if job has parameters
      const jobInfo = await this.getJobDetails(jobName);
      const hasParameters = jobInfo.property?.some(prop => prop._class.includes('ParametersDefinitionProperty'));
      
      if (hasParameters && Object.keys(parameters).length > 0) {
        // Build with parameters
        await this.axios.post(`/job/${encodedJobName}/buildWithParameters`, null, {
          params: parameters
        });
      } else {
        // Build without parameters
        await this.axios.post(`/job/${encodedJobName}/build`);
      }
    } catch (error) {
      console.error(`Error triggering build for job ${jobName}:`, error);
      throw error;
    }
  }

  // Get system statistics
  async getSystemStats(): Promise<any> {
    try {
      // Get overall load statistics
      const loadStats = await this.axios.get('/overallLoad/api/json');
      
      // Get executor information
      const executorInfo = await this.axios.get('/computer/api/json?tree=computer[displayName,executors[idle,likelyStuck,progress]]');
      
      return {
        loadStats: loadStats.data,
        executorInfo: executorInfo.data
      };
    } catch (error) {
      console.error('Error getting Jenkins system stats:', error);
      throw error;
    }
  }

  // Analyze common issues
  async analyzeIssues(): Promise<any> {
    try {
      // Get recent builds to analyze for issues
      const jobs = await this.getJobs();
      const issuesFound = [];
      
      // Check for failed builds
      for (const job of jobs.slice(0, 10)) { // Limit to first 10 jobs for performance
        try {
          const jobDetails = await this.getJobDetails(job.name);
          if (jobDetails.lastBuild) {
            const builds = await this.getBuilds(job.name, 5);
            
            // Check for failed builds
            const failedBuilds = builds.filter(build => build.result === 'FAILURE');
            if (failedBuilds.length > 0) {
              issuesFound.push({
                type: 'Build Failure',
                job: job.name,
                build: `#${failedBuilds[0].number}`,
                time: new Date(failedBuilds[0].timestamp).toLocaleString(),
                severity: failedBuilds.length > 2 ? 'high' : 'medium'
              });
            }
            
            // Check for long-running builds
            const longRunningBuilds = builds.filter(build => build.building && (Date.now() - build.timestamp > 3600000)); // Running for more than 1 hour
            if (longRunningBuilds.length > 0) {
              issuesFound.push({
                type: 'Stuck Build',
                job: job.name,
                build: `#${longRunningBuilds[0].number}`,
                time: new Date(longRunningBuilds[0].timestamp).toLocaleString(),
                severity: 'high'
              });
            }
          }
        } catch (error) {
          console.error(`Error analyzing job ${job.name}:`, error);
        }
      }
      
      // Check queue for stuck items
      try {
        const queue = await this.getQueue();
        const stuckItems = queue.items.filter(item => item.stuck);
        if (stuckItems.length > 0) {
          stuckItems.forEach(item => {
            issuesFound.push({
              type: 'Stuck in Queue',
              job: item.task.name,
              build: 'N/A',
              time: new Date(item.buildableStartMilliseconds).toLocaleString(),
              severity: 'medium'
            });
          });
        }
      } catch (error) {
        console.error('Error analyzing queue:', error);
      }
      
      return {
        issues: issuesFound,
        summary: {
          buildFailures: issuesFound.filter(issue => issue.type === 'Build Failure').length,
          stuckBuilds: issuesFound.filter(issue => issue.type === 'Stuck Build').length,
          queueIssues: issuesFound.filter(issue => issue.type === 'Stuck in Queue').length
        }
      };
    } catch (error) {
      console.error('Error analyzing Jenkins issues:', error);
      throw error;
    }
  }
}

export default JenkinsApiClient;
