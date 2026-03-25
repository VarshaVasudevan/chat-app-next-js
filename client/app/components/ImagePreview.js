'use client';

export default function ImagePreview({ image, onClose }) {
  return (
    <div className="image-preview" onClick={onClose}>
      <img src={image} alt="Preview" />
    </div>
  );
}