import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PostImageCarouselProps {
  images: string[];
  currentImageIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onOpenLightbox: () => void;
}

const PostImageCarousel = ({
  images,
  currentImageIndex,
  onNext,
  onPrev,
  onOpenLightbox,
}: PostImageCarouselProps) => (
  <div className="relative">
    <div className="relative w-full h-80"> {/* Set a fixed height */}
      <img
        src={images[currentImageIndex]}
        alt={`Post image ${currentImageIndex + 1}`}
        className="object-cover w-full h-full cursor-pointer"
        onClick={onOpenLightbox}
        loading="lazy"
      />
    </div>
    {images.length > 1 && (
      <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4">
        <button
          onClick={onPrev}
          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={onNext}
          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
        >
          <FaChevronRight />
        </button>
      </div>
    )}
  </div>
);

export default PostImageCarousel;
