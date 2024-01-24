export interface EducationalResource {
  resourceId: number;
  title: string;
  content: string;
  contentType: string;
  media: string | null;
  likesCount: number;
  sharesCount: number;
  savesCount: number;
  createdAt: Date,
  categories: string[],
  likedByUser: boolean;
  sharedByUser: boolean;
  savedByUser: boolean
}
