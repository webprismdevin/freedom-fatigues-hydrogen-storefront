import {useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

/**
 *
 * @param handle - the handle of the product. i.e. "product-1"
 * @param event - rebuy calls this (stupidly) "noun" - it's the event type
 */

interface RebuyEventProps {
  handle: string;
  event: 'viewed' | 'added' | 'removed';
}

interface RebuyEventProps {
  handle: string;
  event: 'viewed' | 'added' | 'removed';
}

export default function useRebuyEvent({handle, event}: RebuyEventProps): void {
  const [rebuy_uuid, setRebuy_uuid] = useState<string | null>(null);

  useEffect(() => {
    // Check if window object exists
    if (typeof window !== 'undefined') {
      // Check if the session token exists
      let session_uuid: string | null = sessionStorage.getItem('rebuy_uuid');

      // If not, create one and store it in session storage
      if (!session_uuid) {
        session_uuid = uuidv4();
        sessionStorage.setItem('rebuy_uuid', session_uuid);
      }

      // Set the state variable
      setRebuy_uuid(session_uuid);
    }
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    if (rebuy_uuid) {
      const params = new URLSearchParams({
        key: '269507ca244802f7cfc0b6570a09d34463258094', // This is the public API key
        verb: event,
        noun: 'product',
        subject: 'user',
        shopify_product_handle: handle,
        uuid: rebuy_uuid,
      });

      fetch(
        `https://rebuyengine.com/api/v1/analytics/event?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [rebuy_uuid, handle, event]); // This effect runs when rebuy_uuid, handle or event changes
}
