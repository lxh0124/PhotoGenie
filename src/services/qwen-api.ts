import axios from 'axios';

export interface QwenConfig {
  apiKey: string;
  endpoint?: string;
}

export interface SegmentationResult {
  success: boolean;
  maskData?: Buffer;
  error?: string;
}

export interface SegmentationOptions {
  targetWidth?: number;
  targetHeight?: number;
  backgroundColor?: string;
  instruction?: string;
}

export interface FaceDetectionResult {
  success: boolean;
  faces?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  error?: string;
}

const DEFAULT_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

export class QwenAPIService {
  private apiKey: string;
  private endpoint: string;

  constructor(config: QwenConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || DEFAULT_ENDPOINT;
  }

  async segmentPerson(imageBuffer: Buffer, options?: SegmentationOptions): Promise<SegmentationResult> {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      // 构建详细的指令
      let instruction = options?.instruction || '精确抠出人物主体，移除所有背景';
      
      if (options?.backgroundColor) {
        instruction += `，将背景替换为${options.backgroundColor}`;
      }
      
      if (options?.targetWidth && options?.targetHeight) {
        instruction += `，调整图片尺寸为${options.targetWidth}x${options.targetHeight}像素`;
      }
      
      instruction += '。保持人物清晰，边缘自然，确保符合证件照标准。';
      
      const response = await axios.post(
        this.endpoint,
        {
          model: 'qwen-image-edit-max',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  {
                    image: `data:image/jpeg;base64,${base64Image}`
                  },
                  {
                    text: instruction
                  }
                ]
              }
            ]
          },
          parameters: {
            n: 1,
            watermark: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (response.data.output?.choices?.[0]?.message?.content?.[0]?.image) {
        const imageUrl = response.data.output.choices[0].message.content[0].image;
        
        // 如果是 URL，下载图片
        if (imageUrl.startsWith('http')) {
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
          });
          return {
            success: true,
            maskData: Buffer.from(imageResponse.data)
          };
        }
        
        // 如果是 base64，直接解码
        if (imageUrl.startsWith('data:image')) {
          const base64Data = imageUrl.split(',')[1];
          return {
            success: true,
            maskData: Buffer.from(base64Data, 'base64')
          };
        }
      }

      return {
        success: false,
        error: 'No mask data returned'
      };
    } catch (error) {
      console.error('Qwen segmentation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async detectFaces(imageBuffer: Buffer): Promise<FaceDetectionResult> {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/vision/face-detection/detect',
        {
          model: 'face-detection-v1',
          input: {
            image_url: `data:image/jpeg;base64,${base64Image}`
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data.output?.faces) {
        return {
          success: true,
          faces: response.data.output.faces.map((face: any) => ({
            x: face.box.x,
            y: face.box.y,
            width: face.box.width,
            height: face.box.height,
            confidence: face.confidence
          }))
        };
      }

      return {
        success: false,
        error: 'No faces detected'
      };
    } catch (error) {
      console.error('Qwen face detection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export async function createQwenService(apiKey: string): Promise<QwenAPIService> {
  return new QwenAPIService({ apiKey });
}
