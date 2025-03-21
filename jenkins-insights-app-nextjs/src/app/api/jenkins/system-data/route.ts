import { NextRequest, NextResponse } from 'next/server';
import JenkinsApiClient from '@/lib/jenkins-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connection } = body;
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Missing required field: connection' },
        { status: 400 }
      );
    }
    
    const client = new JenkinsApiClient(connection);
    
    // Get system stats
    const systemStats = await client.getSystemStats();
    
    // Get nodes
    const nodes = await client.getNodes();
    
    // Get queue
    const queue = await client.getQueue();
    
    return NextResponse.json({ 
      success: true, 
      data: {
        systemStats,
        nodes,
        queue
      }
    });
  } catch (error) {
    console.error('Error fetching system data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system data', details: error.message },
      { status: 500 }
    );
  }
}
