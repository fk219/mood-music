import { Link } from "react-router-dom";
import LegalPage from "../components/LegalPage";

const Terms = () => (
  <LegalPage
    title="Terms"
    intro="MoodMusic is a free beta listening room run as a personal project. These terms are short on purpose. By using MoodMusic, you agree to them."
  >
    <section className="legal-section">
      <h2>1. A beta service</h2>
      <p>
        MoodMusic is experimental and offered for free. Features may change, break,
        or be removed without notice. The service may be unavailable at times,
        and data may be lost. Do not use MoodMusic as the only copy of a track or
        cover art you care about, and do not rely on it for anything important.
      </p>
    </section>

    <section className="legal-section">
      <h2>2. Your account</h2>
      <p>
        Provide accurate account details and keep your password private. You are
        responsible for activity that happens through your account. Tell me at{" "}
        <a href="mailto:furqank219@gmail.com">furqank219@gmail.com</a> if you
        believe someone else has access to it.
      </p>
    </section>

    <section className="legal-section">
      <h2>3. Acceptable use</h2>
      <p>Do not use MoodMusic to:</p>
      <ul>
        <li>break the law or encourage others to break it;</li>
        <li>access accounts or systems you do not own or have permission to use;</li>
        <li>
          probe, overload, or disrupt the app or API, including scraping at
          abusive rates;
        </li>
        <li>upload malware or any file that could harm the service or its users;</li>
        <li>harass, threaten, or abuse other people.</li>
      </ul>
    </section>

    <section className="legal-section">
      <h2>4. Uploads</h2>
      <p>
        Only upload MP3 files you created or have permission to share. The Studio
        accepts MP3 files of 15 MB or less with an ID3 title and embedded cover
        art. Do not upload content that is illegal, infringing, hateful, or
        malicious. Uploads join the shared catalog and can be played by people
        using MoodMusic.
      </p>
      <p>
        Uploaded tracks may be removed and access may be suspended if these rules
        are broken.
      </p>
    </section>

    <section className="legal-section">
      <h2>5. Content ownership</h2>
      <p>
        You keep ownership of the tracks and cover art you upload. You give
        MoodMusic permission to store, stream, and display that content inside the
        service. That permission ends when the content is removed from the
        catalog.
      </p>
      <p>
        Your account details and mood entries belong to you. The{" "}
        <Link to="/privacy">Privacy page</Link> explains how they are handled.
      </p>
    </section>

    <section className="legal-section">
      <h2>6. No warranty</h2>
      <p>
        MoodMusic is provided as is and as available. To the extent the law allows,
        there are no warranties, express or implied. I do not promise uptime,
        error-free operation, or that data will never be lost. To the extent the
        law allows, I am not liable for indirect or consequential losses. Nothing
        in these terms limits rights you have under applicable law.
      </p>
    </section>

    <section className="legal-section">
      <h2>7. Termination</h2>
      <p>
        You can stop using MoodMusic at any time. Access may be suspended or ended
        if you break these terms, if the service needs to be protected, or if the
        beta ends. To request account deletion, email{" "}
        <a href="mailto:furqank219@gmail.com">furqank219@gmail.com</a>.
      </p>
    </section>

    <section className="legal-section">
      <h2>8. Changes and contact</h2>
      <p>
        These terms may change as the beta evolves. The last updated date will
        change when they do, and continued use means you accept the updated
        terms. Questions can go to{" "}
        <a href="mailto:furqank219@gmail.com">furqank219@gmail.com</a>.
      </p>
    </section>
  </LegalPage>
);

export default Terms;
