import React, { useState } from 'react';
import { CheckCircle, Mail } from 'lucide-react';

const CONTACT_EMAIL = 'crisiscore-systems@proton.me';

export default function StudyLanding() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ageConfirm: false,
    painExperience: false,
    remoteComfort: false,
    accessibility: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    const value =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.currentTarget.value;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your name or preferred name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide your email address.');
      return;
    }
    if (!formData.ageConfirm) {
      setError('You must confirm you are 18 or older.');
      return;
    }
    if (!formData.painExperience) {
      setError('Please confirm your experience with pain or symptom tracking.');
      return;
    }
    if (!formData.remoteComfort) {
      setError('Please confirm your comfort with a remote session.');
      return;
    }

    const subject = encodeURIComponent('Study 001 interest');
    const body = encodeURIComponent([
      'I am interested in Study 001.',
      '',
      `Name or preferred name: ${formData.name.trim()}`,
      `Email address: ${formData.email.trim()}`,
      `18 or older: ${formData.ageConfirm ? 'yes' : 'no'}`,
      `Pain or symptom tracking experience: ${formData.painExperience ? 'yes' : 'no'}`,
      `Comfortable with a remote session: ${formData.remoteComfort ? 'yes' : 'no'}`,
      `Accessibility needs: ${formData.accessibility.trim() || 'none stated'}`,
      '',
      'I understand this is a usability study, not medical care, and I do not need to share private medical details.',
    ].join('\n'));

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const requestMailto = (subject: string) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <a
        href="#main-content"
        className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-50 focus:p-2 bg-emerald-500 text-white rounded"
      >
        Skip to main content
      </a>

      <main id="main-content" className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Help Test a Local First Pain Tracker
          </h1>

          <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
            I am looking for adults with chronic pain, recurring pain, disability related symptoms,
            or ongoing symptom tracking needs to try PainTracker in a single remote usability
            session.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Important:</strong> This is not medical care or a treatment study. No diagnosis,
              medical history, legal history, or private records are required. You may use fictional or
              sample information during the session.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Session Details</h2>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li><strong>Duration:</strong> 45 to 60 minutes</li>
                <li><strong>Format:</strong> Remote</li>
                <li><strong>Activities:</strong> Basic app tasks and feedback on usability, privacy, trust, and comfort</li>
                <li><strong>Compensation:</strong> None provided</li>
                <li><strong>Participation:</strong> Voluntary; you may stop at any time</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Study Status</h2>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                <li><strong>Independent</strong> study</li>
                <li><strong>Unfunded</strong></li>
                <li><strong>Solo developer</strong> conducting the research</li>
                <li><strong>Pre-pilot</strong> phase</li>
                <li><strong>Not institutionally ethics reviewed</strong></li>
              </ul>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">
                This study does not replace institutional review or medical ethics oversight. Participation is voluntary and you may withdraw at any time.
              </p>
            </section>

            <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-500" />
                Questions?
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Contact the research lead at:{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Before You Sign Up</h2>
              <div className="space-y-3 mb-6">
                <a
                  href={requestMailto('Request Study 001 consent form')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Request Consent Form
                </a>
                <a
                  href={requestMailto('Request Study 001 protocol')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Request Study Protocol
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Request the current consent form and protocol before deciding whether to volunteer.
              </p>
            </div>
          </aside>
        </div>

        <section className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            I'm Interested
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This page does not store or send your information. It opens an email draft so you can review it before sending.
          </p>

          {submitted && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 flex items-start gap-4 mb-6">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                  Email Draft Opened
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Review the draft in your email app before sending. Nothing was stored by this page.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Name or Preferred Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="ageConfirm"
                  checked={formData.ageConfirm}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-500 rounded border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  I am 18 years of age or older
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="painExperience"
                  checked={formData.painExperience}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-500 rounded border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 mt-0.5"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  I live with chronic pain, recurring pain, or have symptom tracking needs
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="remoteComfort"
                  checked={formData.remoteComfort}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-500 rounded border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  I am comfortable participating in a remote session
                </span>
              </label>
            </div>

            <div>
              <label htmlFor="accessibility" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Accessibility Needs (Optional)
              </label>
              <textarea
                id="accessibility"
                name="accessibility"
                value={formData.accessibility}
                onChange={handleChange}
                placeholder="Let us know if you need any accommodations, such as a quiet environment, extra time, or specific software."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              Open Email Draft
            </button>

            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              Do not include private medical details. Request and review the current consent form and protocol before volunteering.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
