import React, { useEffect, useState, forwardRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useBird } from './BirdContext'; // Импортируем контекст

const Bird = forwardRef(({ isFalling, currentY }, ref) => {
  const { bought, number } = useBird();

  const imagesToUse = bought[number] || [];

  const props = useSpring({
    to: {
      transform: `translateY(${currentY}px) rotate(${isFalling ? '40deg' : '-60deg'})`,
    },
    config: { tension: 350, friction: 50 },
  });

  return (
    <animated.div ref={ref} style={props} className='player'>
      {imagesToUse.length > 0 && (
        <img src={imagesToUse} alt="bird" className='bird' />
      )}
    </animated.div>
  );
});

export default Bird;