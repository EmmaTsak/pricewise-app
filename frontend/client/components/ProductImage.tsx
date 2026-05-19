import { useMemo, useState } from "react";
import { ImageOff } from "lucide-react";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackSources?: (string | null | undefined)[];
};

export default function ProductImage({
  src,
  alt,
  className = "",
  imgClassName,
  fallbackSources = [],
}: ProductImageProps) {
  const imageSources = useMemo(() => {
    const allSources = [src, ...fallbackSources];

    return allSources.filter(
      (source): source is string =>
        typeof source === "string" && source.trim().length > 0
    );
  }, [src, fallbackSources]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = imageSources[currentImageIndex];

  const handleImageError = () => {
    const nextImageIndex = currentImageIndex + 1;

    if (nextImageIndex < imageSources.length) {
      setCurrentImageIndex(nextImageIndex);
    }
  };

  if (!currentImage) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 ${className}`}
      >
        <ImageOff size={28} />
      </div>
    );
  }

  return (
    <img
      src={currentImage}
      alt={alt}
      className={imgClassName ?? className}
      onError={handleImageError}
      loading="lazy"
    />
  );
}