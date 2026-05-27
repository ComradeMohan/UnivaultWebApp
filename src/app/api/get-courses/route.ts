import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://14.139.187.229:8081/univault/get_prep_courses.php', {
      headers: {
        'Content-Type': 'application/json',
      },
       cache: 'no-store', // Ensure fresh data on every request
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch courses via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the course data service.', error: error.message },
      { status: 500 }
    );
  }
}
