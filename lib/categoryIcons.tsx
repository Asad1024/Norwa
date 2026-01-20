// Get category emoji - returns emoji string or null if no icon is set
export const getCategoryEmoji = (
  categoryName: string | null | undefined,
  iconEmoji?: string | null
): string | null => {
  // If iconEmoji is provided and not empty, return it
  if (iconEmoji && iconEmoji.trim() !== '') {
    return iconEmoji
  }
  
  // If iconEmoji is null, undefined, or empty string, return null (no icon)
  // This means the icon was removed or never set - don't show any default icon
  return null
}
