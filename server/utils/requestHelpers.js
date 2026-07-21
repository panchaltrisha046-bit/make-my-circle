const getSuggestionExcludedIds = (currentUserId, requests = []) => {
  const excludedIds = (requests || [])
    .filter((request) => request.status === 'accepted' || request.status === 'pending')
    .map((request) => {
      const sender = request.sender?.toString ? request.sender.toString() : request.sender;
      const receiver = request.receiver?.toString ? request.receiver.toString() : request.receiver;
      return sender === currentUserId ? receiver : sender;
    });

  return Array.from(new Set([currentUserId, ...excludedIds]));
};

module.exports = { getSuggestionExcludedIds };
