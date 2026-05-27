import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch('http://14.139.187.229:8081/univault/submit_theory_answers_updated.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            return NextResponse.json({ success: false, message: errorJson.message || 'An error occurred on the backend.' }, { status: response.status });
        } catch {
             return NextResponse.json({ success: false, message: errorText || 'An unknown error occurred.' }, { status: response.status });
        }
    }

    const resultText = await response.text();
    // The backend might send back warnings before the JSON. We need to find the JSON.
    const jsonStartIndex = resultText.indexOf('{');
    if (jsonStartIndex === -1) {
        // If no JSON is found, but the request was OK, we can assume success
        // This can happen if the PHP script just echoes a success message without JSON
        if (resultText.toLowerCase().includes('success')) {
             return NextResponse.json({ success: true, message: "Answers submitted successfully." });
        }
        console.error("No JSON object in save-theory-result response:", resultText);
        return NextResponse.json({ success: false, message: 'Invalid response from the server.' }, { status: 500 });
    }
    
    const jsonString = resultText.substring(jsonStartIndex);
    const result = JSON.parse(jsonString);

    return NextResponse.json(result, { status: response.status });

  } catch (error: any) {
    console.error('Failed to save theory answers via proxy:', error);
    return NextResponse.json(
      { success: false, message: 'Could not connect to the answer saving service.', error: error.message },
      { status: 500 }
    );
  }
}
