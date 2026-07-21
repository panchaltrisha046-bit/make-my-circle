export const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });
};

export const buildPromptTitle = (content) => {
  const clean = String(content || '').trim();
  if (!clean) return 'New Conversation';
  return clean.length > 40 ? `${clean.slice(0, 40)}...` : clean;
};
