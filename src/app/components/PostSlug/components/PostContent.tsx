import { FaTag } from "react-icons/fa";

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
    <p className="text-gray-700 mb-4">
      {isExpanded ? description : `${description.slice(0, 150)}...`}
      <button
        onClick={onToggleExpand}
        className="text-blue-600 hover:text-blue-700 ml-1 text-sm font-medium"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </p>
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