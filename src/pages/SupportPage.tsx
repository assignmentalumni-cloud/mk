import { useState } from 'react';
import { Mail, MessageSquare, Clock, HelpCircle, ChevronDown, ChevronUp, Phone, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SUPPORT_EMAIL = 'Assignmentalumni@gmail.com';

export function SupportPage() {
  const { isDark } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const glassClass = isDark ? 'glass-dark' : 'glass-light';

  const faqs = [
    {
      question: 'What is the minimum word count requirement?',
      answer: 'All submissions require a strict minimum of 1,000 words. Submissions below this threshold will be automatically rejected by the verification system.',
    },
    {
      question: 'How do the deposit tiers work?',
      answer: 'Tier I ($35 deposit) unlocks 1 daily assignment at $1.70 payout. Tier II ($70 deposit) unlocks 2 daily assignments at $1.70 each, totaling $3.40 daily.',
    },
    {
      question: 'When can I withdraw my earnings?',
      answer: 'Cashout requires 2 new referrals per cycle. Once you have 2 referrals, submit a cashout request which will be processed by admin.',
    },
    {
      question: 'How long does verification take?',
      answer: 'Submissions undergo automated plagiarism and AI-verification scanning. Admin typically reviews within 24-48 hours.',
    },
    {
      question: 'Can I switch between tiers?',
      answer: 'Yes, you can upgrade your tier at any time. The difference in deposit amount will be applied to your account.',
    },
    {
      question: 'How does the referral bonus work?',
      answer: 'When someone signs up using your referral link and completes their escrow deposit, you receive a flat $5.00 bonus credited instantly to your wallet balance.',
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-12 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 mt-6">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Support Portal
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Get help with AssignmentAlumni
          </p>
        </div>

        {/* 24/7 Helpline Block */}
        <div className={`rounded-2xl p-8 mb-8 text-center border-2 ${
          isDark
            ? 'bg-gradient-to-b from-neon-pink/10 to-purple-500/10 border-neon-pink/40'
            : 'bg-gradient-to-b from-neon-pink/5 to-purple-100/50 border-neon-pink/30'
        }`}
        style={{
          boxShadow: isDark ? '0 0 40px rgba(255, 0, 60, 0.15)' : 'none',
        }}
        >
          <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'} flex items-center justify-center mx-auto mb-4`}>
            <Phone className={`w-8 h-8 text-neon-pink`} />
          </div>
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            For immediate assistance with account activation, verification holds, or payment processing, please contact our dedicated 24/7 helpline at:
          </h2>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=AssignmentAlumni Support Request`}
            className={`inline-flex items-center gap-2 text-2xl font-bold transition-all ${
              isDark
                ? 'text-neon-pink hover:text-pink-400 glow-text'
                : 'text-neon-pink hover:text-pink-600'
            }`}
          >
            <Mail className="w-6 h-6" />
            {SUPPORT_EMAIL}
          </a>
          <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Click the email address above to open your default email client
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className={`${glassClass} p-6 text-center`}>
            <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'} flex items-center justify-center mx-auto mb-4`}>
              <Mail className={`w-6 h-6 text-neon-pink`} />
            </div>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Email Support
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {SUPPORT_EMAIL}
            </p>
          </div>

          <div className={`${glassClass} p-6 text-center`}>
            <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'} flex items-center justify-center mx-auto mb-4`}>
              <MessageSquare className={`w-6 h-6 text-neon-pink`} />
            </div>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Live Chat
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Available 24/7
            </p>
          </div>

          <div className={`${glassClass} p-6 text-center`}>
            <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'} flex items-center justify-center mx-auto mb-4`}>
              <Clock className={`w-6 h-6 text-neon-pink`} />
            </div>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Response Time
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Within 24 hours
            </p>
          </div>
        </div>

        <div className={`${glassClass} p-6 mb-8`}>
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className={`w-6 h-6 text-neon-pink`} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className={`w-full p-4 text-left flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                >
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className={`px-4 pb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p className="text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`${glassClass} p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Submit a Support Request
          </h2>
          <form className="space-y-4">
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Subject
              </label>
              <input
                type="text"
                placeholder="Brief description of your issue"
                className={`w-full px-4 py-3 rounded-xl ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-pink/50'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                } outline-none transition-all`}
              />
            </div>
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Describe your issue in detail..."
                className={`w-full px-4 py-3 rounded-xl resize-none ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-pink/50'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/50'
                } outline-none transition-all`}
              />
            </div>
            <button type="submit" className={`w-full ${isDark ? 'btn-neon-dark' : 'btn-neon-light'}`}>
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
