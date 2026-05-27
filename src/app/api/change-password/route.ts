import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // The frontend sends JSON, so we parse it first.
    const body = await request.json();

    // The backend expects multipart/form-data, so we construct it.
    const formData = new FormData();
    formData.append('student_number', body.student_number);
    formData.append('old_password', body.current_password);
    formData.append('new_password', body.new_password);
    formData.append('user_type', 'student');

    const response = await fetch('http://14.139.187.229:8081/univault/change_password.php', {
      method: 'POST',
      // No 'Content-Type' header needed; fetch sets it automatically for FormData
      body: formData,
    });

    const resultText = await response.text();
    const jsonStartIndex = resultText.indexOf('{');
    
    if (jsonStartIndex === -1) {
      console.error("No JSON object in change_password response:", resultText);
      return NextResponse.json({ success: false, message: 'Invalid response from the server.' }, { status: 500 });
    }

    const jsonString = resultText.substring(jsonStartIndex);
    const result = JSON.parse(jsonString);

    return NextResponse.json(result, { status: response.status });

  } catch (error: any) {
    console.error('Failed to change password via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the password service.', error: error.message },
      { status: 500 }
    );
  }
}
