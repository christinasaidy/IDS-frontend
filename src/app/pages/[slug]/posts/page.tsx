import SocialMediaPost from "../../../components/PostSlug/PostDetail";
import { notFound } from "next/navigation";

interface Author {
  id: number;
  userName: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  tags: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  author: Author;
  category: { id: number; name: string };
}

async function getPost(postId: string): Promise<Post | null> {
  try {
    const response = await fetch(`http://localhost:5128/posts/${postId}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

interface PageProps {
  params: {
    slug: string;
  };
}

const PostPage = async ({ params }: PageProps) => {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <SocialMediaPost initialPost={{
        ...post,
        timestamp: new Date(post.timestamp), // Convert string to Date object for proper handling
      }} />
    </main>
  );
};

export default PostPage;