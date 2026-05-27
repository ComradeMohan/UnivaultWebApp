import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('student_id');
  const courseId = searchParams.get('course_id');

  if (!studentId || !courseId) {
    return NextResponse.json(
      { success: false, message: 'Student ID and Course ID are required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/get_combined_test_history.php?student_id=${studentId}&course_id=${courseId}`, {
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
    console.error('Failed to fetch test history via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the test history service.', error: error.message },
      { status: 500 }
    );
  }
}
