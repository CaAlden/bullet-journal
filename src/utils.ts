import { useEffect, useRef, useState, useCallback } from 'react';

export const useIsMounted = () => {
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    }
  }, []);
  return isMounted;
};

export const useHovered = (): [boolean, (node: null | HTMLElement) => void] => {
  const isMounted = useIsMounted();
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef<HTMLElement>(null);
  const mouseOverRef = useRef(() => {
    if (isMounted.current) {
      setHovered(true);
    }
  });

  const mouseOutRef = useRef(() => {
    if (isMounted.current) {
      setHovered(false);
    }
  });

  const cbkRef = useCallback((node: null | HTMLElement) => {
    if (node === null) {
      if (isMounted.current && nodeRef.current) {
        nodeRef.current.removeEventListener('mouseover', mouseOverRef.current);
        nodeRef.current.removeEventListener('mouseout', mouseOutRef.current);
      }
    } else if (isMounted.current) {
      if (nodeRef.current) {
        nodeRef.current.removeEventListener('mouseover', mouseOverRef.current);
        nodeRef.current.removeEventListener('mouseout', mouseOutRef.current);
      }

      nodeRef.current = node;
      nodeRef.current.addEventListener('mouseover', mouseOverRef.current);
      nodeRef.current.addEventListener('mouseout', mouseOutRef.current);
    }
  }, []);

  return [hovered, cbkRef];
};
