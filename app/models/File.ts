interface VisionFile {
  visionId: string;
  name: string;
  type: string;
  url: string;
  createdAt: Date;
}

interface RagFile {
  name: string;
  path: string;
  ragId: string;
  purpose: string;
  processed: boolean;
}
