import sharp from 'sharp';

export interface BackgroundColor {
  r: number;
  g: number;
  b: number;
}

export interface ProcessOptions {
  width: number;
  height: number;
  dpi?: number;
  background?: BackgroundColor;
  quality?: number;
}

export interface CropOptions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export async function replaceBackground(
  imageBuffer: Buffer,
  maskBuffer: Buffer,
  backgroundColor: BackgroundColor
): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const background = sharp({
    create: {
      width: metadata.width!,
      height: metadata.height!,
      channels: 3,
      background: backgroundColor
    }
  }).png();

  const mask = sharp(maskBuffer)
    .resize(metadata.width, metadata.height)
    .toColorspace('b-w')
    .png();

  const [bgBuffer, maskPngBuffer] = await Promise.all([
    background.toBuffer(),
    mask.toBuffer()
  ]);

  const result = await sharp(bgBuffer)
    .composite([
      {
        input: imageBuffer,
        blend: 'over'
      },
      {
        input: maskPngBuffer,
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  return result;
}

export async function resizeImage(
  imageBuffer: Buffer,
  options: ProcessOptions
): Promise<Buffer> {
  let pipeline = sharp(imageBuffer)
    .resize(options.width, options.height, {
      fit: 'cover',
      position: 'center'
    });

  if (options.background) {
    pipeline = pipeline.flatten({
      background: options.background
    });
  }

  if (options.dpi) {
    pipeline = pipeline.withMetadata({
      density: options.dpi
    });
  }

  return pipeline
    .jpeg({ quality: options.quality || 95 })
    .toBuffer();
}

export async function cropImage(
  imageBuffer: Buffer,
  cropOptions: CropOptions
): Promise<Buffer> {
  return sharp(imageBuffer)
    .extract({
      left: Math.round(cropOptions.left),
      top: Math.round(cropOptions.top),
      width: Math.round(cropOptions.width),
      height: Math.round(cropOptions.height)
    })
    .toBuffer();
}

export async function adjustImageSize(
  imageBuffer: Buffer,
  targetWidth: number,
  targetHeight: number,
  backgroundColor: BackgroundColor
): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const currentWidth = metadata.width!;
  const currentHeight = metadata.height!;

  const scaleWidth = targetWidth / currentWidth;
  const scaleHeight = targetHeight / currentHeight;
  const scale = Math.min(scaleWidth, scaleHeight);

  const resizedWidth = Math.round(currentWidth * scale);
  const resizedHeight = Math.round(currentHeight * scale);

  const resized = await sharp(imageBuffer)
    .resize(resizedWidth, resizedHeight, {
      fit: 'contain'
    })
    .toBuffer();

  const paddingLeft = Math.round((targetWidth - resizedWidth) / 2);
  const paddingTop = Math.round((targetHeight - resizedHeight) / 2);

  return sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 3,
      background: backgroundColor
    }
  })
    .composite([
      {
        input: resized,
        left: paddingLeft,
        top: paddingTop
      }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();
}

export async function setImageDPI(
  imageBuffer: Buffer,
  dpi: number
): Promise<Buffer> {
  return sharp(imageBuffer)
    .withMetadata({
      density: dpi
    })
    .toBuffer();
}

export async function getImageMetadata(imageBuffer: Buffer) {
  return sharp(imageBuffer).metadata();
}
