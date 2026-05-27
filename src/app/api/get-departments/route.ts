import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json(
      { success: false, message: 'College ID is required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/fetch_departments_by_college.php?college_id=${collegeId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // The response is a JSON array, not an object with a success key.
    const data = await response.json();
    
    // We will wrap it in a success structure for consistency with the other API.
    return NextResponse.json({ success: true, departments: data });
  } catch (error: any) {
    console.error('Failed to fetch departments via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the department data service.', error: error.message },
      { status: 500 }
    );
  }
}
