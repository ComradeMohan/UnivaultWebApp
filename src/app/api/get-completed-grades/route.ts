import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('department_id');
  const studentId = searchParams.get('student_id');

  if (!departmentId || !studentId) {
    return NextResponse.json(
      { success: false, message: 'Department ID and Student ID are required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/student_grades_completed.php?department_id=${departmentId}&student_id=${studentId}`, {
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
    console.error('Failed to fetch grades via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the grades service.', error: error.message },
      { status: 500 }
    );
  }
}
