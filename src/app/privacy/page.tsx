export default function PrivacyPage() {
  return (
    <div className="container py-12 prose dark:prose-invert max-w-4xl mx-auto">
      <h1>Privacy Policy</h1>
      <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to UniVault. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
      </p>

      <h2>2. Collection of Your Information</h2>
      <p>
        We may collect information about you in a variety of ways. The information we may collect via the Application includes:
      </p>
      <ul>
        <li>
          <strong>Personal Data:</strong> Personally identifiable information, such as your name, student number, and email address, that you voluntarily give to us when you register with the Application.
        </li>
        <li>
          <strong>Academic Data:</strong> Information related to your academic progress, such as course enrollments, test results, grades, and CGPA, which are fetched from your university's backend systems.
        </li>
        <li>
          <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.
        </li>
      </ul>

      <h2>3. Use of Your Information</h2>
      <p>
        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
      </p>
      <ul>
        <li>Create and manage your account.</li>
        <li>Display your academic records and progress.</li>
        <li>Provide you with personalized test preparation materials.</li>
        <li>Compile anonymous statistical data and analysis for internal use.</li>
        <li>Notify you of updates and important academic notifications.</li>
        <li>Increase the efficiency and operation of the Application.</li>
      </ul>

      <h2>4. Disclosure of Your Information</h2>
      <p>
        We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes.
      </p>

      <h2>5. Security of Your Information</h2>
      <p>
        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
      </p>

      <h2>6. Policy for Children</h2>
      <p>
        We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        If you have questions or comments about this Privacy Policy, please contact us through the contact form on our application.
      </p>
    </div>
  )
}
