
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentNumber = body.student_number;

    if (!studentNumber) {
      return NextResponse.json(
        { success: false, message: 'Student number is required.' },
        { status: 400 }
      );
    }

    const response = await fetch('http://14.139.187.229:8081/univault/forgot_password.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_number: studentNumber }),
    });
    
    // The backend might not send a valid JSON response on success, but might send text.
    // We'll check the status and text content.
    const resultText = await response.text();

    if (!response.ok) {
        try {
            const errorJson = JSON.parse(resultText);
            return NextResponse.json({ success: false, message: errorJson.message || 'An error occurred on the backend.' }, { status: response.status });
        } catch {
             return NextResponse.json({ success: false, message: resultText || 'An unknown error occurred.' }, { status: response.status });
        }
    }
    
    // Attempt to parse JSON, but handle cases where it's just text
    try {
        const jsonResult = JSON.parse(resultText);
        return NextResponse.json(jsonResult, { status: response.status });
    } catch (e) {
        // If parsing fails, check for success keywords in the text response
        if (resultText.toLowerCase().includes('success') || resultText.toLowerCase().includes('sent')) {
            return NextResponse.json({ success: true, message: resultText });
        }
        // Fallback for non-JSON, non-success-keyword responses
        return NextResponse.json({ success: false, message: resultText || 'Invalid response from server.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Forgot password proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the password reset service.', error: error.message },
      { status: 500 }
    );
  }
}
