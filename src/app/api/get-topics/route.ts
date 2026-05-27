import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseCode = searchParams.get('course_code');
  const mode = searchParams.get('mode');

  if (!courseCode || !mode) {
    return NextResponse.json(
      { success: false, message: 'Course code and mode are required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/get_topics.php?course_code=${courseCode}&mode=${mode}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Failed to fetch topics via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the topics service.', error: error.message },
      { status: 500 }
    );
  }
}
