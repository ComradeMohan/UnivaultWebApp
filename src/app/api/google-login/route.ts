import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch('http://14.139.187.229:8081/univault/google_login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const resultText = await response.text();
    
    // The backend might send back warnings before the JSON. We need to find the JSON.
    const jsonStartIndex = resultText.indexOf('{');
    if (jsonStartIndex === -1) {
        console.error("No JSON object in google_login response:", resultText);
        return NextResponse.json({ success: false, message: 'Invalid response from authentication server.' }, { status: 500 });
    }
    
    const jsonString = resultText.substring(jsonStartIndex);
    const result = JSON.parse(jsonString);

    return NextResponse.json(result, { status: response.status });

  } catch (error: any) {
    console.error('Failed to login with Google via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the Google authentication service.', error: error.message },
      { status: 500 }
    );
  }
}
