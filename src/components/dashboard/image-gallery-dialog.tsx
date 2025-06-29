'use client';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';

type ImageGalleryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrls: string[];
};

export default function ImageGalleryDialog({ open, onOpenChange, imageUrls }: ImageGalleryDialogProps) {
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-transparent border-0 shadow-none">
        <Carousel className="w-full">
          <CarouselContent>
            {imageUrls.map((url, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                    <div className="relative aspect-video">
                        <Image
                            src={url}
                            alt={`Transaction image ${index + 1}`}
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
