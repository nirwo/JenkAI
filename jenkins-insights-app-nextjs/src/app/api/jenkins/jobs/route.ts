import { NextRequest, NextResponse } from 'next/server';
import JenkinsApiClient from '@/lib/jenkins-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connection } = body;
    
    if (!connection || !connection.url || !connection.username || !connection.token) {
      return NextResponse.json(
        { error: 'Invalid connection details' },
        { status: 400 }
      );
    }
    
    const client = new JenkinsApiClient(connection);
    
    // Get jobs
    const jobs = await client.getJobs();
    
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching Jenkins jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error.message },
      { status: 500 }
    );
  }
}
