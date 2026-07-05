import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { FileUp, FileText, File, X, Upload, Check, AlertCircle, FileCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Notification } from './Notification';

interface UploadedFile {
  name: string;
  type: string;
  size: string;
}

interface WorksheetEditorProps {
  onSubmit: (content: string, files: UploadedFile[]) => void;
  isSubmitting: boolean;
  taskId: string;
  assignmentIndex: number;
}

const MINIMUM_WORDS = 1000;

export function WorksheetEditor({ onSubmit, isSubmitting, taskId, assignmentIndex }: WorksheetEditorProps) {
  const { isDark } = useTheme();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const glassClass = isDark ? 'glass-dark' : 'glass-light';
  const btnClass = isDark ? 'btn-neon-dark' : 'btn-neon-light';

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const meetsMinimum = wordCount >= MINIMUM_WORDS;

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateFileUpload = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const validExtensions = ['.docx', '.pdf'];
    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (validExtensions.includes(ext)) {
        newFiles.push({
          name: file.name,
          type: ext.replace('.', '').toUpperCase(),
          size: file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(file.size / 1024).toFixed(0)} KB`,
        });
      }
    });

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      setShowNotification(true);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      simulateFileUpload(e.dataTransfer.files);
    },
    [simulateFileUpload]
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      simulateFileUpload(e.target.files);
    },
    [simulateFileUpload]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = () => {
    if (!meetsMinimum) return;
    onSubmit(content, files);
  };

  if (!isOpen) {
    return (
      <div className={`${glassClass} p-6 text-center`}>
        <div className="mb-4">
          <FileText className={`w-12 h-12 mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Assignment #{assignmentIndex + 1} Worksheet
        </h3>
        <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Reference: {taskId}
        </p>
        <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Click below to open your writing environment
        </p>
        <button onClick={() => setIsOpen(true)} className={btnClass}>
          <span className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Open Worksheet
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${glassClass} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Main Worksheet Environment
          </h3>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Task {assignmentIndex + 1} - {taskId}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
        >
          <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your Submission
          </span>
          <div className={`flex items-center gap-3 text-sm`}>
            <span className={`${meetsMinimum ? (isDark ? 'text-green-400' : 'text-green-600') : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {wordCount.toLocaleString()} words
            </span>
            <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Min: {MINIMUM_WORDS.toLocaleString()}
            </span>
            {meetsMinimum && (
              <Check className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            )}
          </div>
        </div>

        <div className={`relative rounded-xl overflow-hidden ${isDark ? 'bg-cosmic-midnight' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <div
              className={`h-full transition-all duration-300 ${meetsMinimum ? 'bg-green-500' : 'bg-neon-pink'}`}
              style={{ width: `${Math.min((wordCount / MINIMUM_WORDS) * 100, 100)}%` }}
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin your academic submission here..."
            className={`w-full h-64 p-4 pt-6 resize-none outline-none ${isDark ? 'bg-transparent text-white placeholder-gray-500' : 'bg-transparent text-gray-900 placeholder-gray-400'}`}
            disabled={isSubmitting}
          />
        </div>

        {!meetsMinimum && wordCount > 0 && (
          <div className={`mt-2 flex items-center gap-2 text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
            <AlertCircle className="w-4 h-4" />
            <span>Need {(MINIMUM_WORDS - wordCount).toLocaleString()} more word{(MINIMUM_WORDS - wordCount) !== 1 ? 's' : ''} to submit</span>
          </div>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDragging
            ? isDark
              ? 'border-neon-pink bg-neon-pink/10'
              : 'border-neon-pink bg-neon-pink/5'
            : isDark
            ? 'border-white/10 hover:border-white/20'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          type="file"
          accept=".docx,.pdf"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isSubmitting}
        />
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-neon-pink' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {isDragging ? 'Drop files here' : 'Drag & drop files or click to upload'}
        </p>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Supports .docx and .pdf
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Attached Files ({files.length})
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-neon-pink/10' : 'bg-neon-pink/10'}`}>
                  <File className={`w-4 h-4 text-neon-pink`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {file.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {file.type} - {file.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!meetsMinimum || isSubmitting}
          className={`w-full ${btnClass} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Submit Daily Assignment'
          )}
        </button>
      </div>

      <Notification
        message="File uploaded successfully!"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
