/**
 * SEO Rules for Images and Alt Attributes
 */
export const checkImageRules = (parsedData) => {
  const { images = [] } = parsedData;
  const rules = [];

  const total = images.length;

  if (total === 0) {
    rules.push({
      id: 'images-none',
      category: 'mediaLinks',
      name: 'Image Content',
      status: 'info',
      severity: 'info',
      score: 5,
      maxScore: 5,
      message: 'No <img> elements found on the page.',
      recommendation: null
    });
    return rules;
  }

  let missingAltCount = 0;
  let emptyAltCount = 0;
  let validAltCount = 0;

  images.forEach((img) => {
    if (img.alt === null || img.alt === undefined) {
      missingAltCount++;
    } else if (img.alt === '') {
      emptyAltCount++;
    } else {
      validAltCount++;
    }
  });

  if (missingAltCount > 0) {
    const percentage = Math.round((missingAltCount / total) * 100);
    const score = Math.max(0, Math.round(5 * (1 - missingAltCount / total)));

    rules.push({
      id: 'images-missing-alt',
      category: 'mediaLinks',
      name: 'Image Alt Attributes',
      status: percentage > 50 ? 'fail' : 'warning',
      severity: percentage > 50 ? 'high' : 'medium',
      score,
      maxScore: 5,
      message: `${missingAltCount} out of ${total} images (${percentage}%) are completely missing an alt attribute.`,
      recommendation: 'Add descriptive alt text to meaningful images for web accessibility compliance and image search context. (Use alt="" explicitly for purely decorative images).'
    });
  } else {
    rules.push({
      id: 'images-alt-complete',
      category: 'mediaLinks',
      name: 'Image Alt Attributes',
      status: 'pass',
      severity: 'info',
      score: 5,
      maxScore: 5,
      message: `All ${total} images on the page have alt attributes defined (${validAltCount} descriptive, ${emptyAltCount} decorative).`,
      recommendation: null
    });
  }

  return rules;
};
