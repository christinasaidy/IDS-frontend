import { FaTag } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CSSProperties } from "react";

interface PostContentProps {
  title: string;
  category: string;
  description: string;
  tags: string[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const PostContent = ({
  title,
  category,
  description,
  tags,
  isExpanded,
  onToggleExpand,
}: PostContentProps) => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-2">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        {category}
      </span>
    </div>
    <div className="text-gray-700 mb-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark as { [key: string]: CSSProperties }}
                language={match[1]}
                PreTag="div" {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {isExpanded ? description : `${description.slice(0, 150)}...`}
      </ReactMarkdown>
      <button
        onClick={onToggleExpand}
        className="text-blue-600 hover:text-blue-700 ml-1 text-sm font-medium"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
    <div className="flex items-center space-x-2 mb-4">
      <FaTag className="text-gray-500" />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default PostContent;