import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://14.139.187.229:8081/univault/get_colleges.php', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch colleges via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the college data service.', error: error.message },
      { status: 500 }
    );
  }
}
