import LegalPage from "../components/LegalPage";

const Privacy = () => (
  <LegalPage
    title="Privacy"
    intro="MoodMusic is a small beta listening room. This page explains what it stores, why, and how to have it removed. It describes the service as it works today."
  >
    <section className="legal-section">
      <h2>1. What MoodMusic stores</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your username and email address, plus
          a bcrypt hash of your password. Your password is never stored in plain
          text.
        </li>
        <li>
          <strong>Mood entries:</strong> the mood recorded (happy, sad, angry,
          surprised, or neutral), whether it came from a camera read or a manual
          check-in, and the time it was saved. Each entry is linked to your
          account.
        </li>
        <li>
          <strong>Track metadata:</strong> for catalog uploads, the title, mood
          tag, cover art, and media URL of the MP3. The files themselves are
          stored by ImageKit. This is catalog data, not listener data.
        </li>
        <li>
          <strong>Request data:</strong> like any hosted service, Vercel and
          Render process request metadata such as IP address, time, and path to
          deliver the app and protect the API. MoodMusic does not build a separate
          advertising profile.
        </li>
      </ul>
    </section>

    <section className="legal-section">
      <h2>2. Camera and mood detection</h2>
      <p>
        Face detection runs in your browser with MediaPipe.{" "}
        <strong>
          Camera frames are processed on your device and are not uploaded or
          stored.
        </strong>{" "}
        When a check-in is saved, only the resulting mood label and its source
        (camera or manual) are sent to the API.
      </p>
      <p>
        The MediaPipe runtime files are served by jsDelivr, and the face
        landmarker model is downloaded from Google's MediaPipe model storage.
        Those services receive the requests needed to deliver those files. You
        can deny camera permission and use the manual mood picker instead.
      </p>
    </section>

    <section className="legal-section">
      <h2>3. Cookies and local storage</h2>
      <ul>
        <li>
          <strong>Session cookie:</strong> a cookie named <code>token</code>{" "}
          holds your JWT session. It is httpOnly, Secure, and SameSite=Lax, and
          the token expires after 1 day.
        </li>
        <li>
          <strong>Logout blacklist:</strong> when you sign out, the token is
          added to a blacklist in MongoDB Atlas so it cannot be reused.
          Blacklist entries expire after 24 hours.
        </li>
        <li>
          <strong>Local mood trail:</strong> your browser keeps the last five
          mood trail entries and a local marker for the account that owns them,
          so the trail survives a refresh. This stays on your device. The
          journal's Clear history action removes the local trail and your saved
          mood entries.
        </li>
        <li>
          <strong>Analytics:</strong> Vercel Web Analytics counts page views
          without setting analytics cookies.
        </li>
      </ul>
    </section>

    <section className="legal-section">
      <h2>4. Third-party processors</h2>
      <p>
        MoodMusic uses these services to run. They process data on MoodMusic's behalf
        or, for fonts and MediaPipe assets, deliver files to your browser.
      </p>
      <ul>
        <li>
          <strong>Vercel:</strong> hosts the web app and provides page-view
          analytics.
        </li>
        <li>
          <strong>Render:</strong> hosts the API server.
        </li>
        <li>
          <strong>MongoDB Atlas:</strong> stores accounts, mood entries, track
          metadata, and the logout blacklist.
        </li>
        <li>
          <strong>ImageKit:</strong> stores and delivers uploaded MP3 files and
          cover art.
        </li>
        <li>
          <strong>Google Fonts:</strong> serves the typefaces used by the
          interface.
        </li>
        <li>
          <strong>jsDelivr:</strong> serves MediaPipe runtime assets. Google's
          MediaPipe model storage serves the face landmarker model.
        </li>
      </ul>
      <p>
        These providers handle requests under their own privacy terms. MoodMusic
        does not sell personal data.
      </p>
    </section>

    <section className="legal-section">
      <h2>5. Retention and deletion</h2>
      <ul>
        <li>
          Account details and mood entries are kept until you clear the journal
          or ask for your account to be deleted.
        </li>
        <li>Logout blacklist entries are removed automatically after 24 hours.</li>
        <li>
          Uploaded catalog tracks stay in the library until the operator removes
          them.
        </li>
        <li>
          Provider logs and backups may persist for a limited period under each
          provider's retention settings.
        </li>
      </ul>
      <p>
        To delete your account and its mood entries, email{" "}
        <a href="mailto:furqank219@gmail.com">furqank219@gmail.com</a> from the
        address on the account. Account deletion is handled by hand while
        MoodMusic is in beta. You can also clear your journal from the room at any
        time.
      </p>
    </section>

    <section className="legal-section">
      <h2>6. Security</h2>
      <p>
        Passwords are hashed with bcrypt, the session cookie is httpOnly,
        production traffic is served over HTTPS, and the API applies rate limits
        to writes. No service can promise perfect security, so use a unique
        password and do not reuse one from another site.
      </p>
    </section>

    <section className="legal-section">
      <h2>7. Changes and contact</h2>
      <p>
        If this page changes, the last updated date will change with it.
        Questions about privacy can go to{" "}
        <a href="mailto:furqank219@gmail.com">furqank219@gmail.com</a>.
      </p>
    </section>
  </LegalPage>
);

export default Privacy;
