import {useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './for-parents.module.css';

export default function ForParents() {
  const [message, setMessage] = useState('');

  function eraseLocalData() {
    if (
      !window.confirm(
        'Erase every ChloeLabs project, evidence card, notebook entry, and draft stored in this browser? Download a backup first if you may want it later.',
      )
    ) {
      return;
    }
    try {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith('chloelabs:'))
        .forEach((key) => window.localStorage.removeItem(key));
      window.dispatchEvent(new Event('chloelabs:notebook-changed'));
      setMessage('All ChloeLabs projects, evidence, notebook entries, and drafts were erased from this browser.');
    } catch {
      setMessage('This browser could not erase its ChloeLabs data.');
    }
  }

  return (
    <Layout
      title="For Parents"
      description="How ChloeLabs uses AI, stores learner work, and supports safer exploration.">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className="container">
            <span>Trust, privacy, and learning</span>
            <Heading as="h1">For Parents and Learning Partners</Heading>
            <p>
              ChloeLabs is a prototype project coach for curious learners. This
              page explains what it does today—including its limitations.
            </p>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <section className={styles.summary}>
            <article>
              <strong>Designed for</strong>
              <p>Learners ages 7–15, with adult review for safety-sensitive projects.</p>
            </article>
            <article>
              <strong>Private by default</strong>
              <p>Notebook writing stays in the learner’s current browser.</p>
            </article>
            <article>
              <strong>AI as coach</strong>
              <p>AI suggests structure. The learner supplies the thinking and evidence.</p>
            </article>
          </section>

          <TrustSection title="What ChloeLabs is">
            <p>
              ChloeLabs helps a learner turn a curiosity into something they
              can learn, build, investigate, create, or share. It is currently
              an early prototype being designed and tested with Chloe as its
              first learner. It is not a school, tutor, assessment, childcare
              service, or substitute for adult judgment.
            </p>
            <p>
              Learners choose <strong>Show me</strong>,{' '}
              <strong>Let me try</strong>, or <strong>Challenge me</strong>.
              That choice changes the age band sent with an AI request so
              explanations can use smaller steps or deeper questions.
              ChloeLabs does not ask for or send a birth date.
            </p>
          </TrustSection>

          <TrustSection title="What is sent to AI">
            <p>
              When a learner requests ideas, the site sends limited planning
              information through a ChloeLabs Cloudflare Worker to the OpenAI
              API. Depending on the path, this can include the topic, age band,
              selected question, desired format, time, difficulty, available
              tools, investigation setting, or a general audience description.
            </p>
            <p>
              ChloeLabs does not send the learner’s notebook writing,
              reflections, build notes, measurements, evidence table,
              conclusions, original storyboard, or sharing script to the AI.
              Each path shows its exact boundary before generation.
            </p>
            <p>
              OpenAI states that API inputs and outputs are not used to train
              its models by default unless the API customer opts in. ChloeLabs
              requests <code>store: false</code> so Responses API application
              state is not intentionally stored. Standard abuse-monitoring logs
              may still contain prompts and responses for up to 30 days.
            </p>
            <SourceLinks />
          </TrustSection>

          <TrustSection title="Cloudflare and service metadata">
            <p>
              Cloudflare receives the request because it runs the small
              ChloeLabs API. ChloeLabs uses a short-lived rate-limit counter
              based on the connecting IP address to prevent excessive requests.
              Routine Worker invocation logs are disabled. Limited error logs
              can still be created for troubleshooting, but the Worker does not
              deliberately log learner prompts or notebook content.
            </p>
            <p>
              Cloudflare and OpenAI operate under their own privacy and security
              terms. This prototype should not be used for sensitive,
              confidential, medical, or identifying information.
            </p>
            <p className={styles.sources}>
              Official references:{' '}
              <a href="https://developers.cloudflare.com/workers/observability/logs/workers-logs/">
                Cloudflare Workers Logs
              </a>{' '}
              ·{' '}
              <a href="https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/">
                Cloudflare rate limiting
              </a>
            </p>
          </TrustSection>

          <TrustSection title="Where notebook work is stored">
            <p>
              Project Workspaces, drafts, and notebook entries are saved in
              browser local storage on the device being used. Project names,
              questions, goals, status, and next actions stay in the browser
              and are not sent to AI. There is currently no ChloeLabs learner
              account or cloud notebook database. Work does not automatically
              follow the learner to another browser or device.
            </p>
            <p>
              Families can download and import a complete project-and-notebook
              backup from{' '}
              <Link to="/my-lab-notebook">My Lab Notebook</Link>. Clearing
              browser data may permanently remove local work unless a backup
              has been downloaded.
            </p>
          </TrustSection>

          <TrustSection title="Publishing and personal information">
            <p>
              ChloeLabs does not automatically publish notebook entries,
              projects, photographs, or AI output. The current prototype has no
              public learner profiles, messaging, advertising, or social
              gallery.
            </p>
            <p>
              Learners should not enter full names, contact details, exact
              locations, school names, passwords, health information, or
              identifying details about themselves or other people. Use general
              descriptions such as “my family” or “my class.”
            </p>
          </TrustSection>

          <TrustSection title="Adult and project-safety review">
            <p>
              AI-generated plans are suggestions, not verified instructions.
              An adult should review any activity involving tools, sharp
              objects, heat, electricity, chemicals, food, medicine, animals,
              outdoor locations, downloads, external websites, account
              creation, photographs, or interactions with other people.
            </p>
            <div className={styles.stopCard}>
              <strong>When in doubt: stop and ask an adult.</strong>
              <span>
                A project can always become a safe model, diagram, simulation,
                observation, or discussion instead.
              </span>
            </div>
          </TrustSection>

          <TrustSection title="Accuracy and learner authorship">
            <p>
              AI can be incomplete, outdated, or wrong. Learn includes linked
              sources, but a source link does not guarantee that every sentence
              is correct. Important claims should be checked with an adult and
              an authoritative source.
            </p>
            <p>
              ChloeLabs intentionally keeps evidence, conclusions, creative
              writing, and final explanations in the learner’s hands. AI
              assistance should be acknowledged when a project is shared.
            </p>
          </TrustSection>

          <TrustSection title="Your browser-data controls">
            <div className={styles.controls}>
              <Link className="button button--primary" to="/my-lab-notebook">
                Open My Lab Notebook
              </Link>
              <button className="button button--secondary" onClick={eraseLocalData}>
                Erase ChloeLabs data from this browser
              </button>
            </div>
            {message && <p className={styles.message} role="status">{message}</p>}
          </TrustSection>

          <TrustSection title="Questions or concerns">
            <p>
              ChloeLabs does not yet provide formal customer support. A parent
              or guardian can report a technical or safety concern through the{' '}
              <a href="https://github.com/CHLOELabs/chloelabs/issues">
                public GitHub issue tracker
              </a>
              . Do not include a child’s personal information in an issue.
            </p>
            <p className={styles.prototype}>
              This is a plain-language prototype disclosure, not a formal
              privacy policy, consent mechanism, or substitute for legal review.
            </p>
          </TrustSection>
        </div>
      </main>
    </Layout>
  );
}

function TrustSection({title, children}) {
  return (
    <section className={styles.section}>
      <Heading as="h2">{title}</Heading>
      {children}
    </section>
  );
}

function SourceLinks() {
  return (
    <p className={styles.sources}>
      Official references:{' '}
      <a href="https://platform.openai.com/docs/models/default-usage-policies-by-endpoint">
        OpenAI API data controls
      </a>{' '}
      ·{' '}
      <a href="https://openai.com/business-data/">
        OpenAI business data privacy
      </a>
    </p>
  );
}
