import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('course_id');

  if (!courseId) {
    return NextResponse.json(
      { success: false, message: 'Course ID is required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/get_mcq_questions.php?course_id=${courseId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch MCQ questions via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the MCQ service.', error: error.message },
      { status: 500 }
    );
  }
}
