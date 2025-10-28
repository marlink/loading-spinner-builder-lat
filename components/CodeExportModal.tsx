import React, { useState, useMemo, useEffect } from 'react';
import type { SpinnerConfig } from '../types';
import { generateCode, ExportType } from '../utils/codeExport';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SpinnerConfig;
}

const exportOptions = [
  { id: ExportType.SVG, label: 'Animated SVG' },
  { id: ExportType.CSS, label: 'HTML + CSS' },
  { id: ExportType.GSAP, label: 'GSAP (JS)' },
];

const CodeBlock: React.FC<{ language: string; code: string; title: string; }> = ({ language, code, title }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-900 rounded-lg my-4">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50 rounded-t-lg">
                <p className="text-sm font-semibold text-gray-300">{title} ({language})</p>
                <button
                    onClick={handleCopy}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto text-indigo-200">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose, config }) => {
  const [activeTab, setActiveTab] = useState<ExportType>(ExportType.SVG);

  const generatedCode = useMemo(() => {
    if (!isOpen) return { html: '', css: '', js: ''};
    return generateCode(config, activeTab);
  }, [config, activeTab, isOpen]);

  useEffect(() => {
    if (!isOpen) {
        setActiveTab(ExportType.SVG); // Reset to default tab when closed
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 text-white rounded-lg shadow-2xl p-8 w-full max-w-2xl m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Export Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-700 mb-4">
            <nav className="flex space-x-4" aria-label="Tabs">
                {exportOptions.map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                        ${activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}
                        whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                    `}
                    >
                    {tab.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
            {generatedCode.html && <CodeBlock language="html" code={generatedCode.html} title="HTML" />}
            {generatedCode.css && <CodeBlock language="css" code={generatedCode.css} title="CSS" />}
            {generatedCode.js && <CodeBlock language="javascript" code={generatedCode.js} title="JavaScript" />}
        </div>

      </div>
    </div>
  );
};
