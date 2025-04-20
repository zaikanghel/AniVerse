export default function CookiePolicy() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead">
          This Cookie Policy explains how AnimeVerse uses cookies and similar technologies to recognize you when you 
          visit our website. It explains what these technologies are and why we use them, as well as your rights to 
          control our use of them.
        </p>
        
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
          Cookies are widely used by website owners to make their websites work more efficiently and to provide 
          reporting information.
        </p>
        <p>
          Cookies set by the website owner (in this case, AnimeVerse) are called "first-party cookies". Cookies set 
          by parties other than the website owner are called "third-party cookies". Third-party cookies enable 
          third-party features or functionality on or through the website (such as advertising, interactive content, 
          and analytics).
        </p>
        
        <h2>2. Why Do We Use Cookies?</h2>
        <p>
          We use cookies for several reasons:
        </p>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They 
            enable basic functions like page navigation and access to secure areas of the website.
          </li>
          <li>
            <strong>Functional Cookies:</strong> These cookies allow us to remember choices you make (such as your 
            username, language, or region) and provide enhanced features.
          </li>
          <li>
            <strong>Performance Cookies:</strong> These cookies collect information about how you use our website, such 
            as which pages you visit and any errors you encounter. This helps us improve how our website works.
          </li>
          <li>
            <strong>Targeting Cookies:</strong> These cookies are used to deliver advertisements that are more relevant 
            to you and your interests.
          </li>
        </ul>
        
        <h2>3. Types of Cookies We Use</h2>
        <p>
          On the AnimeVerse platform, we use the following types of cookies:
        </p>
        <h3>Session Cookies</h3>
        <p>
          Session cookies are temporary cookies that expire when you close your browser. These are used to remember 
          your selections and preferences during your current visit.
        </p>
        
        <h3>Persistent Cookies</h3>
        <p>
          Persistent cookies remain on your device for a set period or until you delete them. These help us recognize 
          you as a returning visitor and remember your preferences for future visits.
        </p>
        
        <h2>4. Specific Cookies We Use</h2>
        <p>
          Below is a detailed list of the cookies we use on our website:
        </p>
        <table className="border-collapse border border-gray-300 my-4 w-full">
          <thead>
            <tr className="bg-secondary/20">
              <th className="border border-gray-300 p-2 text-left">Cookie Name</th>
              <th className="border border-gray-300 p-2 text-left">Purpose</th>
              <th className="border border-gray-300 p-2 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">session_id</td>
              <td className="border border-gray-300 p-2">Authentication and session management</td>
              <td className="border border-gray-300 p-2">Session</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">user_preferences</td>
              <td className="border border-gray-300 p-2">Stores user preferences like theme, language</td>
              <td className="border border-gray-300 p-2">1 year</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">recently_viewed</td>
              <td className="border border-gray-300 p-2">Tracks recently viewed content</td>
              <td className="border border-gray-300 p-2">30 days</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">_ga (Google Analytics)</td>
              <td className="border border-gray-300 p-2">Used to distinguish users</td>
              <td className="border border-gray-300 p-2">2 years</td>
            </tr>
          </tbody>
        </table>
        
        <h2>5. How to Control Cookies</h2>
        <p>
          You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences 
          through our cookie consent banner or by adjusting the settings in your browser.
        </p>
        
        <h3>Browser Controls</h3>
        <p>
          Most web browsers allow you to control cookies through their settings preferences. For more information on 
          how to manage cookies in your web browser, please visit:
        </p>
        <ul>
          <li>Chrome: <a href="https://support.google.com/chrome/answer/95647" className="text-primary">https://support.google.com/chrome/answer/95647</a></li>
          <li>Firefox: <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-primary">https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer</a></li>
          <li>Safari: <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-primary">https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac</a></li>
          <li>Internet Explorer: <a href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies" className="text-primary">https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies</a></li>
        </ul>
        <p>
          Please note that if you choose to block cookies, some features of our website may not function properly.
        </p>
        
        <h2>6. Changes to This Cookie Policy</h2>
        <p>
          We may update our Cookie Policy from time to time to reflect changes in technology, regulation, or our 
          business practices. Any changes will be posted on this page with an updated revision date.
        </p>
        
        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us at:
        </p>
        <p>
          Email: privacy@animeverse.com<br />
          Address: 123 Anime Street, Tokyo, Japan 100-0001
        </p>
        
        <p className="text-sm text-gray-500 mt-8">
          Last updated: April 20, 2025
        </p>
      </div>
    </main>
  );
}