import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
}: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Preview da Imagem</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Image
            src={imageUrl}
            alt="Preview"
            width={400}
            height={400}
            objectFit="contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
