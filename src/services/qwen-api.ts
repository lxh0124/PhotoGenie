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

const DEFAULT_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation';

export class QwenAPIService {
  private apiKey: string;
  private endpoint: string;

  constructor(config: QwenConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || DEFAULT_ENDPOINT;
  }

  async segmentPerson(imageBuffer: Buffer): Promise<SegmentationResult> {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const response = await axios.post(
        this.endpoint,
        {
          model: 'qwen-image-edit-max',
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            prompt: 'Remove background, keep only the person'
          },
          parameters: {
            task: 'background-removal'
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

      if (response.data.output?.results?.[0]?.url) {
        const imageUrl = response.data.output.results[0].url;
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer'
        });
        
        return {
          success: true,
          maskData: Buffer.from(imageResponse.data)
        };
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
