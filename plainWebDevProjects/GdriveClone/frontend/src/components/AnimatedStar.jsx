import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { Star, StarOff } from 'lucide-react';

const AnimatedStar = ({ isStarred, size = 16, onClick }) => {
  const [clicked, setClicked] = useState(false);
  const [prevStarred, setPrevStarred] = useState(isStarred);

  // Trigger animation when starred state changes
  useEffect(() => {
    if (isStarred !== prevStarred) {
      setPrevStarred(isStarred);
      setClicked(true);
      const timer = setTimeout(() => setClicked(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isStarred]);

  // Animate on click - scale up then back with rotation
  const { scale, rotate } = useSpring({
    scale: clicked ? 1.6 : 1,
    rotate: clicked ? (isStarred ? 360 : -360) : 0,
    config: { tension: 500, friction: 20 },
    onRest: () => {
      if (clicked) {
        setTimeout(() => setClicked(false), 100);
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setClicked(true);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <animated.button
      type="button"
      style={{
        transform: scale.to(s => `scale(${s})`),
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleClick}
    >
      <animated.div
        style={{
          transform: rotate.to(r => `rotate(${r}deg)`),
          display: 'inline-flex'
        }}
      >
        {isStarred ? (
          <Star size={size} fill="#fbbc04" color="#fbbc04" />
        ) : (
          <StarOff size={size} />
        )}
      </animated.div>
    </animated.button>
  );
};

export default AnimatedStar;

