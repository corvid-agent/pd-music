export interface ArchiveItem {
  identifier: string;
  title: string;
  creator: string;
  date: string;
  description: string;
  files: ArchiveFile[];
}

export interface ArchiveFile {
  name: string;
  format: string;
  size: string;
  length: string;
  source: string;
}
