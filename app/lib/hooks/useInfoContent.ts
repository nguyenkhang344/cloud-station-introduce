/**
 * Generic hook to fetch content data from JSON files
 * Supports both HomeInfo and HillInfo content structures
 */

export interface ContentCard {
  title: string;
  paragraphs?: string[];
  description?: string;
  buttonText?: string;
  buttonAction?: string;
}

export interface ContentData {
  [key: string]: ContentCard;
}

export const useInfoContent = (data: { [key: string]: any }, key: string | number): ContentCard | null => {
  if (!key) return null;

  const stringKey = key.toString();
  const content = data[stringKey];

  return content || null;
};

/**
 * Get content from cards structure (used by HomeInfo)
 */
export const getHomeInfoContent = (data: any, stageNumber: number | string): ContentCard | null => {
  return useInfoContent(data.cards, stageNumber);
};

/**
 * Get content from hills structure (used by HillInfo)
 */
export const getHillInfoContent = (data: any, hillKey: string): ContentCard | null => {
  return useInfoContent(data.hills, hillKey);
};
