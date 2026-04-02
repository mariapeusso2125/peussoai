'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  parts?: Array<{ type: string; text?: string }>;
}

const markdownComponents: Components = {
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse text-sm" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-gray-200 bg-gray-100 px-3 py-1.5 text-left font-semibold text-xs" {...props}>{children}</th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-gray-200 px-3 py-1.5 text-xs" {...props}>{children}</td>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc ml-4 my-1 space-y-0.5" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal ml-4 my-1 space-y-0.5" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-sm leading-relaxed" {...props}>{children}</li>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-1.5 last:mb-0 leading-relaxed" {...props}>{children}</p>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold" {...props}>{children}</strong>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="font-semibold text-sm mt-2 mb-1" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="font-medium text-sm mt-1.5 mb-0.5" {...props}>{children}</h4>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return <code className="bg-gray-200/50 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>;
    }
    return <code className="block bg-gray-200/50 p-2 rounded text-xs font-mono overflow-x-auto my-1" {...props}>{children}</code>;
  },
};

export default function ChatMessage({ role, parts }: ChatMessageProps) {
  const text = parts
    ?.filter(p => p.type === 'text')
    .map(p => p.text)
    .join('') || '';

  if (role === 'user') {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 text-white" style={{backgroundColor: '#001F5F'}}>
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex justify-start">
      <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{backgroundColor: '#001F5F'}}>
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-500">Iluminar AI</span>
        </div>
        <div className="text-sm text-gray-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
