import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BirdContext = createContext();

export const BirdProvider = ({ children }) => {
  const [bought, setBought] = useState(['./bird1.png', './bird2.png', './bird3.png', './bird4.png', './bird5.png']);
  const [back, setBack] = useState(['./backgroundcity.png', './backgroundforest.png', './backgroundmush.png']);
  const [down, setDown] = useState(['./downcity.png', './downforest.png', './downmush.png']);
  const [number, setNumber] = useState(0);
  const [numberBackground, setNumberBackground] = useState(0);
  const [numberDown, setNumberDown] = useState(0);
  const [countHeart, setCountHeart] = useState(1);

  const fetchDat = async () => {
    try {
      const response = await axios.get("http://localhost:3000/dataall");
      const heartone = response.data.heartone || 0;
      const hearttwo = response.data.hearttwo || 0;
  
      console.log("Fetched values:", heartone, hearttwo);
  
      setCountHeart((prev) => {
        const newCount = prev + (heartone / 2 + hearttwo / 2);
        console.log("Updated countHeart:", newCount);
        return newCount;
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDat();
  }, []);

  const [point, setPoint] = useState(0);
  const [ariseC, setAriseC] = useState(0);

  return (
    <BirdContext.Provider value={{ down, setDown, numberDown, setNumberDown, back, setBack, ariseC, setAriseC, point, setPoint, bought, setBought, number, setNumber, countHeart, setCountHeart, numberBackground, setNumberBackground }}>
      {children}
    </BirdContext.Provider>
  );
};

export const useBird = () => {
  return useContext(BirdContext);
};