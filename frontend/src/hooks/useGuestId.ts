import { useState, useEffect } from 'react';

export const useGuestId = () => {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    let id = sessionStorage.getItem('temporaryId');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('temporaryId', id);
    }
    setGuestId(id);
  }, []);

  return guestId;
};
