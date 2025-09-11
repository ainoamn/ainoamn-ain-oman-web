import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface VirtualTourProps {
  images: string[];
  is360?: boolean;
}

export default function VirtualTour({ images, is360 = false }: VirtualTourProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (is360) {
    return (
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-96 rounded-lg'}`}>
        <iframe
          src={`/api/360-viewer?images=${encodeURIComponent(JSON.stringify(images))}`}
          className="w-full h-full"
          allowFullScreen
        />
        
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full"
        >
          {isFullscreen ? 'تصغير' : 'تكبير'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        className="h-96 rounded-lg"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`Property image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}