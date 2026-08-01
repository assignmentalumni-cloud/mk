import React from 'react';

export default function Announcement() {
  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Latest Announcements</h1>
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold text-neon-pink flex items-center gap-2">
          🎁 Share & Earn Program Live!
        </h2>
        <p className="mt-3 text-gray-300">
          Invite your friends to join our network! For every user who registers using your unique referral link, you will receive a <strong className="text-white">$5 bonus reward</strong> credited straight to your account.
        </p>
        <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700 inline-block text-xs text-gray-400">
          💡 There is no limit to how many friends you can invite. Start sharing today!
        </div>
      </div>
    </div>
  );
}
