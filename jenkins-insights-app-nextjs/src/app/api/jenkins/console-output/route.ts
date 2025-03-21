import { NextRequest, NextResponse } from 'next/server';
import JenkinsApiClient from '@/lib/jenkins-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connection, jobName, buildNumber } = body;
    
    if (!connection || !jobName || !buildNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: connection, jobName, or buildNumber' },
        { status: 400 }
      );
    }
    
    const client = new JenkinsApiClient(connection);
    
    // Get build console output
    const consoleOutput = await client.getBuildConsoleOutput(jobName, buildNumber);
    
    // Parse console output for errors and exceptions
    const errors = parseConsoleForErrors(consoleOutput);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        consoleOutput,
        errors
      }
    });
  } catch (error) {
    console.error('Error fetching console output:', error);
    return NextResponse.json(
      { error: 'Failed to fetch console output', details: error.message },
      { status: 500 }
    );
  }
}

// Function to parse console output for common errors and exceptions
function parseConsoleForErrors(consoleOutput: string): Array<{line: number, text: string, type: string}> {
  const errors = [];
  const lines = consoleOutput.split('\n');
  
  // Common error patterns to look for
  const errorPatterns = [
    { regex: /error:|exception:|failure:|failed:/i, type: 'general' },
    { regex: /exception in thread|java\.lang\.[a-z]+exception/i, type: 'java' },
    { regex: /npm err!|cannot find module|syntax error/i, type: 'javascript' },
    { regex: /importerror:|modulenotfounderror:|syntaxerror:/i, type: 'python' },
    { regex: /fatal:|error:|warning:/i, type: 'build' },
    { regex: /out of memory|java\.lang\.outofmemoryerror/i, type: 'memory' },
    { regex: /connection refused|timeout|unreachable/i, type: 'network' },
    { regex: /permission denied|access denied|unauthorized/i, type: 'permission' }
  ];
  
  // Scan each line for error patterns
  lines.forEach((line, index) => {
    for (const pattern of errorPatterns) {
      if (pattern.regex.test(line)) {
        errors.push({
          line: index + 1,
          text: line.trim(),
          type: pattern.type
        });
        break; // Only match one pattern per line
      }
    }
  });
  
  return errors;
}
