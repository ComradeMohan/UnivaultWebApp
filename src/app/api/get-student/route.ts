import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentNumber = searchParams.get('student_number');

  if (!studentNumber) {
    return NextResponse.json(
      { success: false, message: 'Student number is required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://14.139.187.229:8081/univault/get_student.php?student_number=${studentNumber}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const resultText = await response.text();
    const jsonStartIndex = resultText.indexOf('{');
    if (jsonStartIndex === -1) {
        console.error("No JSON object in get_student response:", resultText);
        return NextResponse.json({ success: false, message: 'Invalid response from student data service.' }, { status: 500 });
    }
    
    const jsonString = resultText.substring(jsonStartIndex);
    const data = JSON.parse(jsonString);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch student data via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the student data service.', error: error.message },
      { status: 500 }
    );
  }
}
