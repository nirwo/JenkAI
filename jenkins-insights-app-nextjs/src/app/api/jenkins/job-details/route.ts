import { NextRequest, NextResponse } from 'next/server';
import JenkinsApiClient from '@/lib/jenkins-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connection, jobName } = body;
    
    if (!connection || !jobName) {
      return NextResponse.json(
        { error: 'Missing required fields: connection or jobName' },
        { status: 400 }
      );
    }
    
    const client = new JenkinsApiClient(connection);
    
    // Get job details
    const jobDetails = await client.getJobDetails(jobName);
    
    // Get recent builds
    const builds = await client.getBuilds(jobName, 10);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        jobDetails,
        builds
      }
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details', details: error.message },
      { status: 500 }
    );
  }
}
