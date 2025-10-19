// src/lib/watermark.ts - نظام العلامة المائية الذكي
import { createCanvas, loadImage } from 'canvas';

export interface WatermarkOptions {
  text?: string;
  logoPath?: string;
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  fontSize?: number;
  color?: string;
  margin?: number;
}

export class WatermarkGenerator {
  private defaultOptions: WatermarkOptions = {
    text: 'عين عُمان',
    opacity: 0.3,
    position: 'bottom-right',
    fontSize: 24,
    color: '#ffffff',
    margin: 20
  };

  async addWatermarkToImage(
    imageBuffer: Buffer, 
    options: WatermarkOptions = {}
  ): Promise<Buffer> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // تحميل الصورة الأصلية
      const originalImage = await loadImage(imageBuffer);
      
      // إنشاء canvas جديد
      const canvas = createCanvas(originalImage.width, originalImage.height);
      const ctx = canvas.getContext('2d');
      
      // رسم الصورة الأصلية
      ctx.drawImage(originalImage, 0, 0);
      
      // إضافة العلامة المائية
      if (opts.logoPath) {
        await this.addLogoWatermark(ctx, canvas, opts);
      } else if (opts.text) {
        this.addTextWatermark(ctx, canvas, opts);
      }
      
      return canvas.toBuffer('image/jpeg', { quality: 0.9 });
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw error;
    }
  }

  private async addLogoWatermark(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    options: WatermarkOptions
  ): Promise<void> {
    try {
      const logo = await loadImage(options.logoPath!);
      const logoSize = Math.min(canvas.width, canvas.height) * 0.1;
      
      const position = this.calculatePosition(
        canvas.width, 
        canvas.height, 
        logoSize, 
        logoSize, 
        options.position!, 
        options.margin!
      );
      
      ctx.globalAlpha = options.opacity!;
      ctx.drawImage(logo, position.x, position.y, logoSize, logoSize);
      ctx.globalAlpha = 1;
    } catch (error) {
      console.error('Error adding logo watermark:', error);
      // Fallback to text watermark
      this.addTextWatermark(ctx, canvas, options);
    }
  }

  private addTextWatermark(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    options: WatermarkOptions
  ): void {
    ctx.font = `${options.fontSize}px Arial`;
    ctx.fillStyle = options.color!;
    ctx.globalAlpha = options.opacity!;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textMetrics = ctx.measureText(options.text!);
    const textWidth = textMetrics.width;
    const textHeight = options.fontSize!;
    
    const position = this.calculatePosition(
      canvas.width, 
      canvas.height, 
      textWidth, 
      textHeight, 
      options.position!, 
      options.margin!
    );
    
    ctx.fillText(options.text!, position.x + textWidth / 2, position.y + textHeight / 2);
    ctx.globalAlpha = 1;
  }

  private calculatePosition(
    canvasWidth: number, 
    canvasHeight: number, 
    elementWidth: number, 
    elementHeight: number, 
    position: string, 
    margin: number
  ): { x: number; y: number } {
    switch (position) {
      case 'top-left':
        return { x: margin, y: margin };
      case 'top-right':
        return { x: canvasWidth - elementWidth - margin, y: margin };
      case 'bottom-left':
        return { x: margin, y: canvasHeight - elementHeight - margin };
      case 'bottom-right':
        return { x: canvasWidth - elementWidth - margin, y: canvasHeight - elementHeight - margin };
      case 'center':
        return { 
          x: (canvasWidth - elementWidth) / 2, 
          y: (canvasHeight - elementHeight) / 2 
        };
      default:
        return { x: margin, y: margin };
    }
  }

  // إنشاء علامة مائية متعددة (تكرر عبر الصورة)
  async addRepeatedWatermark(
    imageBuffer: Buffer, 
    options: WatermarkOptions = {}
  ): Promise<Buffer> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      const originalImage = await loadImage(imageBuffer);
      const canvas = createCanvas(originalImage.width, originalImage.height);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(originalImage, 0, 0);
      
      ctx.font = `${opts.fontSize}px Arial`;
      ctx.fillStyle = opts.color!;
      ctx.globalAlpha = opts.opacity!;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // حساب المسافات
      const spacing = opts.fontSize! * 3;
      const angle = -Math.PI / 6; // 30 درجة
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);
      
      // رسم النص المتكرر
      for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          ctx.fillText(opts.text!, x, y);
        }
      }
      
      ctx.restore();
      ctx.globalAlpha = 1;
      
      return canvas.toBuffer('image/jpeg', { quality: 0.9 });
    } catch (error) {
      console.error('Error adding repeated watermark:', error);
      throw error;
    }
  }
}

// دالة مساعدة لمعالجة الصور
export async function processImageWithWatermark(
  imageBuffer: Buffer, 
  options?: WatermarkOptions
): Promise<Buffer> {
  const watermarkGenerator = new WatermarkGenerator();
  return await watermarkGenerator.addWatermarkToImage(imageBuffer, options);
}

// دالة لإنشاء صورة مصغرة مع علامة مائية
export async function createThumbnailWithWatermark(
  imageBuffer: Buffer, 
  maxWidth: number = 300, 
  maxHeight: number = 300,
  options?: WatermarkOptions
): Promise<Buffer> {
  try {
    const originalImage = await loadImage(imageBuffer);
    
    // حساب الأبعاد الجديدة
    let { width, height } = originalImage;
    const aspectRatio = width / height;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    // إنشاء canvas للصورة المصغرة
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // رسم الصورة المصغرة
    ctx.drawImage(originalImage, 0, 0, width, height);
    
    // إضافة العلامة المائية
    const watermarkGenerator = new WatermarkGenerator();
    const thumbnailBuffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
    
    return await watermarkGenerator.addWatermarkToImage(thumbnailBuffer, {
      ...options,
      fontSize: Math.max(12, options?.fontSize ? options.fontSize * 0.5 : 12)
    });
  } catch (error) {
    console.error('Error creating thumbnail with watermark:', error);
    throw error;
  }
}
