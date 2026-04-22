import { ImageOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
};

export default function ProductImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: ProductImageProps) {
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);

  const showFallback = !src || hasError;

  if (showFallback) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-white to-brand-cyan/10 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <ImageOff size={22} />
          <span className="text-xs text-center">
            {t("product.noImage")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={imgClassName}
    />
  );
}