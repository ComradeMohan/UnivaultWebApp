import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch('http://14.139.187.229:8081/univault/register-smtp.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // The backend sends back warnings and a JSON object. We need to find the JSON.
    const resultText = await response.text();
    const jsonStartIndex = resultText.indexOf('{');
    if (jsonStartIndex === -1) {
        // If no JSON is found, it's an unexpected server response
        console.error("No JSON object in registration response:", resultText);
        return NextResponse.json({ success: false, message: 'Invalid response from server.' }, { status: 500 });
    }
    
    const jsonString = resultText.substring(jsonStartIndex);
    const result = JSON.parse(jsonString);

    return NextResponse.json(result, { status: response.status });

  } catch (error: any) {
    console.error('Failed to register user via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the registration service.', error: error.message },
      { status: 500 }
    );
  }
}
