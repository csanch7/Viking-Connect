function formatTopicList(topics: string[]) {
  const visibleTopics = topics.slice(0, 3)
  const remainingCount = topics.length - visibleTopics.length

  if (remainingCount > 0) {
    return `${visibleTopics.join(', ')}, and ${remainingCount} more`
  }

  if (visibleTopics.length === 2) {
    return `${visibleTopics[0]} and ${visibleTopics[1]}`
  }

  if (visibleTopics.length === 3) {
    return `${visibleTopics[0]}, ${visibleTopics[1]}, and ${visibleTopics[2]}`
  }

  return visibleTopics[0] ?? ''
}

export function getMentorRecommendationReason(
  matchedTopics: string[],
  sameCollege: boolean,
) {
  if (matchedTopics.length === 0) {
    return sameCollege
      ? 'You share a college connection—a natural place to start.'
      : 'Their experience may complement your mentorship goals.'
  }

  const topics = formatTopicList(matchedTopics)
  const alignment =
    matchedTopics.length === 1
      ? `their experience in ${topics} aligns with one of your interests.`
      : `their experience in ${topics} aligns with your interests.`

  return sameCollege
    ? `You share a college connection, and ${alignment}`
    : `${alignment[0].toUpperCase()}${alignment.slice(1)}`
}

export function getMenteeRecommendationReason(
  matchedTopics: string[],
  sameCollege: boolean,
) {
  if (matchedTopics.length === 0) {
    return sameCollege
      ? 'You share a college connection—a natural place to start.'
      : 'Their goals may be a strong fit for your experience.'
  }

  const topics = formatTopicList(matchedTopics)
  const alignment =
    matchedTopics.length === 1
      ? `their interest in ${topics} matches your experience.`
      : `their interests in ${topics} match your experience.`

  return sameCollege
    ? `You share a college connection, and ${alignment}`
    : `${alignment[0].toUpperCase()}${alignment.slice(1)}`
}
