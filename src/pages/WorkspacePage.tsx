import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Upload,
  CheckCircle,
  Lock,
  AlertCircle,
  X,
  ChevronLeft,
  Loader2,
  Shield,
  FileCheck,
  PenLine,
  Camera,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useGlobalState } from '../hooks/useGlobalState.tsx';
import { WorkspaceLockout } from '../components/WorkspaceLockout';
import type { SubmissionType } from '../types';

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function formatFileSize(bytes: number): number {
  return bytes < 1024 ? bytes : bytes < 1048576 ? bytes / 1024 : bytes / 1048576;
}

type SubmissionMethod = 'local_text' | 'photo_document';

export function WorkspacePage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const {
    isProfileActive,
    currentUserAssignments,
    submitAssignment,
    refreshAssignments,
    taskRestrictionStatus,
  } = useGlobalState();

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Dual submission state
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>('local_text');
  const [photoFile, setPhotoFile] = useState<UploadedFile | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const glass = isDark ? 'glass-dark' : 'glass-light';

  // Refresh current user data to get latest ledger state
  useEffect(() => {
    refreshAssignments();
  }, [refreshAssignments]);

  if (!isProfileActive) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} flex items-center justify-center`}>
        <div className={`${glass} p-8 max-w-md text-center`}>
          <Lock className="w-10 h-10 text-neon-pink mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Not Activated</h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            You must fund an escrow tier before accessing the workspace.
          </p>
          <button onClick={() => navigate('/dashboard')} className={isDark ? 'btn-neon-dark' : 'btn-neon-light'}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Anti-cheat: Show lockout screen when task limit is reached
  if (taskRestrictionStatus.isLocked) {
    return (
      <WorkspaceLockout
        maxAllowed={taskRestrictionStatus.maxAllowed}
        oldestSubmissionTime={taskRestrictionStatus.oldestSubmissionTime}
      />
    );
  }

  const wc = wordCount(content);
  const hasPhotoFile = photoFile !== null;

  // PATH 1: Validation for local text - ONLY word count matters
  const canSubmitText = wc >= 1000;
  // PATH 2: Validation for photo document - ONLY file upload matters
  const canSubmitPhoto = hasPhotoFile;

  const canSubmit = submissionMethod === 'local_text' ? canSubmitText : canSubmitPhoto;

  // ── Photo document handling ───────────────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const file = selected[0];
    if (
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') ||
      file.name.endsWith('.png') || file.name.endsWith('.pdf')
    ) {
      setPhotoFile({ name: file.name, size: `${formatFileSize(file.size).toFixed(1)} ${file.size < 1024 ? 'B' : file.size < 1048576 ? 'KB' : 'MB'}`, type: file.type });
    }
  };

  const handlePhotoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.type === 'application/pdf' ||
        f.name.endsWith('.jpg') || f.name.endsWith('.jpeg') ||
        f.name.endsWith('.png') || f.name.endsWith('.pdf')
    );
    if (dropped.length > 0) {
      const file = dropped[0];
      setPhotoFile({ name: file.name, size: `${formatFileSize(file.size).toFixed(1)} ${file.size < 1024 ? 'B' : file.size < 1048576 ? 'KB' : 'MB'}`, type: file.type });
    }
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (assignment: typeof currentUserAssignments[0]) => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const submissionType: SubmissionType = submissionMethod === 'local_text' ? 'local_text' : 'photo_document';
      const finalText = submissionMethod === 'local_text' ? content : `[Photo Document Submission: ${photoFile?.name}]`;
      const finalFileName = submissionMethod === 'photo_document' ? (photoFile?.name ?? null) : null;
      const estimatedWc = null; // No longer used
      const charCnt = submissionMethod === 'local_text' ? content.length : null;

      await submitAssignment(
        assignment.id,
        assignment.topicId,
        assignment.topicTitle,
        finalText,
        finalFileName,
        submissionType,
        estimatedWc,
        charCnt
      );
      setJustSubmitted(assignment.topicId);
      setActiveIdx(null);
      setContent('');
      setPhotoFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when switching tabs
  const handleMethodChange = (method: SubmissionMethod) => {
    setSubmissionMethod(method);
    if (method === 'local_text') {
      setPhotoFile(null);
    } else {
      setContent('');
    }
  };

  // ── All pending / complete guard ─────────────────────────────────────────────

  const allLocked = currentUserAssignments.length > 0 &&
    currentUserAssignments.every((a) => a.status === 'Submitted_Pending' || a.status === 'Approved');

  const totalDailyPayout = currentUserAssignments.reduce((s, a) => s + a.payout, 0);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-16 px-4`}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
          >
            <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Academic Writing Desk
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete your daily assignments to earn rewards
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${isDark ? 'bg-neon-pink/10 text-neon-pink' : 'bg-neon-pink/10 text-neon-pink'}`}>
              <Shield className="w-3 h-3" />
              {submissionMethod === 'local_text' ? 'Min 1,000 Words' : 'Upload Required'}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              ${totalDailyPayout.toFixed(2)} available today
            </div>
          </div>
        </div>

        {/* Topic Banner - Shows first assigned topic */}
        {currentUserAssignments.length > 0 && !allLocked && (
          <div className={`${glass} p-4 mb-6 border-l-4 border-neon-pink`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10'}`}>
                <BookOpen className="w-5 h-5 text-neon-pink" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-neon-pink' : 'text-neon-pink'}`}>
                  Your Unique Topic for Today
                </p>
                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUserAssignments[0].topicTitle}
                </p>
                {currentUserAssignments.length > 1 && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    +{currentUserAssignments.length - 1} additional assignment{currentUserAssignments.length > 2 ? 's' : ''} available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All locked / complete banner */}
        {allLocked && (
          <div className={`${glass} p-6 mb-6 text-center`}>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Daily Ledger Complete
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              All submissions are pending verification. Your earnings will be credited upon approval.
            </p>
            <p className={`mt-2 text-sm font-medium text-neon-pink`}>
              Potential earnings: ${totalDailyPayout.toFixed(2)}
            </p>
          </div>
        )}

        {/* Assignment cards */}
        <div className="space-y-6">
          {currentUserAssignments.map((assignment, idx) => {
            const isPending = assignment.status === 'Submitted_Pending';
            const isApproved = assignment.status === 'Approved';
            const isOpen = activeIdx === idx;
            const wasJustSubmitted = justSubmitted === assignment.topicId;

            return (
              <div
                key={assignment.id}
                className={`${glass} overflow-hidden transition-all duration-300 ${isPending || isApproved ? 'opacity-80' : ''}`}
              >
                {/* Assignment header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isPending ? (isDark ? 'bg-yellow-500/20' : 'bg-yellow-100') :
                        isApproved ? (isDark ? 'bg-green-500/20' : 'bg-green-100') :
                        (isDark ? 'bg-neon-pink/20' : 'bg-neon-pink/10')
                      }`}>
                        {isPending ? (
                          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                        ) : isApproved ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-neon-pink" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {assignment.id}
                          </span>
                          {isPending && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                              Submitted — Pending Verification
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              Approved
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-semibold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {assignment.topicTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-neon-pink text-sm font-bold">
                            ${assignment.payout.toFixed(2)} payout
                          </span>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {submissionMethod === 'local_text' ? 'Min. 1,000 words' : 'Photo document'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isPending && !isApproved && (
                      <button
                        onClick={() => setActiveIdx(isOpen ? null : idx)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isOpen
                            ? isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                            : isDark ? 'btn-neon-dark' : 'btn-neon-light'
                        }`}
                      >
                        {isOpen ? 'Collapse' : 'Open Editor'}
                      </button>
                    )}
                    {isPending && (
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0 ${isDark ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                        <Lock className="w-3.5 h-3.5" />
                        Page Locked — Under Review
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor panel — expands when open */}
                {isOpen && !isPending && !isApproved && (
                  <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'} p-5 space-y-5`}>

                    {/* ── SUBMISSION METHOD TOGGLE ─────────────────────────────────── */}
                    <div className={`p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => handleMethodChange('local_text')}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                            submissionMethod === 'local_text'
                              ? isDark
                                ? 'bg-neon-pink/20 text-neon-pink'
                                : 'bg-white text-neon-pink shadow-sm'
                              : isDark
                                ? 'text-gray-500 hover:text-gray-300'
                                : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <PenLine className="w-4 h-4" />
                          Type Assignment Locally
                        </button>
                        <button
                          onClick={() => handleMethodChange('photo_document')}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                            submissionMethod === 'photo_document'
                              ? isDark
                                ? 'bg-neon-pink/20 text-neon-pink'
                                : 'bg-white text-neon-pink shadow-sm'
                              : isDark
                                ? 'text-gray-500 hover:text-gray-300'
                                : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Camera className="w-4 h-4" />
                          Upload Handwritten Photo
                        </button>
                      </div>
                    </div>

                    {/* ── PATH 1: LOCAL TEXT EDITOR (Clean - No File Proof) ───────────── */}
                    {submissionMethod === 'local_text' && (
                      <>
                        {/* Word count bar */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Word Count
                            </span>
                            <span className={`text-sm font-bold tabular-nums ${
                              wc >= 1000 ? 'text-green-400' : wc >= 750 ? 'text-yellow-400' : 'text-neon-pink'
                            }`}>
                              {wc.toLocaleString()} / 1,000
                            </span>
                          </div>
                          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                wc >= 1000 ? 'bg-green-400' : wc >= 750 ? 'bg-yellow-400' : 'bg-neon-pink'
                              }`}
                              style={{ width: `${Math.min(100, (wc / 1000) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Textarea */}
                        <div>
                          <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Begin writing your academic essay here. Your submission must be original, well-structured, and meet the 1,000-word minimum requirement..."
                            rows={14}
                            className={`w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-none outline-none transition-all ${
                              isDark
                                ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-pink/40'
                                : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-neon-pink/40'
                            }`}
                          />
                        </div>

                        {/* Requirements checklist */}
                        <div className={`rounded-xl p-4 space-y-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Submission Requirements
                          </p>
                          <div className="flex items-center gap-2">
                            {wc >= 1000 ? (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            )}
                            <span className={`text-xs ${wc >= 1000 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                              1,000 word minimum
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ── PATH 2: PHOTO DOCUMENT SUBMISSION (Clean - No Word Count Input) ── */}
                    {submissionMethod === 'photo_document' && (
                      <>
                        {/* Photo upload area */}
                        <div>
                          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Upload Scanned Document or Photo Proof of Handwritten Assignment <span className="text-neon-pink">*required</span>
                          </p>
                          {!photoFile ? (
                            <div
                              onClick={() => photoInputRef.current?.click()}
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                              onDragLeave={() => setIsDraggingPhoto(false)}
                              onDrop={handlePhotoDrop}
                              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                isDraggingPhoto
                                  ? 'border-neon-pink bg-neon-pink/10'
                                  : isDark
                                  ? 'border-white/20 hover:border-neon-pink/40 hover:bg-white/5'
                                  : 'border-gray-300 hover:border-neon-pink/40 hover:bg-gray-50'
                              }`}
                            >
                              <Camera className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Drop your scanned document or photo here
                              </p>
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                Accepted: JPG, PNG, PDF
                              </p>
                              <button
                                type="button"
                                className={`mt-4 px-4 py-2 rounded-lg text-xs font-medium ${
                                  isDark ? 'bg-neon-pink/20 text-neon-pink hover:bg-neon-pink/30' : 'bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20'
                                } transition-all`}
                              >
                                Browse Files
                              </button>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                                <Camera className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {photoFile.name}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {photoFile.size} — Document uploaded
                                </p>
                              </div>
                              <button
                                onClick={() => setPhotoFile(null)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                              >
                                <X className="w-5 h-5 text-gray-400" />
                              </button>
                            </div>
                          )}
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </div>

                        {/* Requirements checklist for photo */}
                        <div className={`rounded-xl p-4 space-y-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Photo Submission Requirements
                          </p>
                          <div className="flex items-center gap-2">
                            {hasPhotoFile ? (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            )}
                            <span className={`text-xs ${hasPhotoFile ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                              Scanned document or photo attached (JPG, PNG, PDF)
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Submit button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSubmit(assignment)}
                        disabled={!canSubmit || isSubmitting}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                          canSubmit && !isSubmitting
                            ? isDark ? 'btn-neon-dark' : 'btn-neon-light'
                            : isDark
                            ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : !canSubmit ? (
                          <>
                            <Lock className="w-4 h-4" />
                            {submissionMethod === 'local_text' ? (
                              `${1000 - wc} more words required`
                            ) : (
                              'Upload your document photo'
                            )}
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            Submit for Verification — ${assignment.payout.toFixed(2)}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Just-submitted success flash */}
                {wasJustSubmitted && (
                  <div className={`px-5 pb-5`}>
                    <div className={`p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        Submission received — pending admin verification
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No assignments state */}
        {currentUserAssignments.length === 0 && (
          <div className={`${glass} p-10 text-center`}>
            <BookOpen className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Assignments Available
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              All available topics have been completed. Check back tomorrow.
            </p>
            <button
              onClick={refreshAssignments}
              className={`mt-4 ${isDark ? 'btn-neon-dark' : 'btn-neon-light'}`}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
