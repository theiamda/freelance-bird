import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBird } from "./BirdContext";
import "./styles.css";

function Home() {
  const navigate = useNavigate();

  const {
    numberBackground,
    setPoint,
    back,
    numberDown,
    down
  } = useBird();

  useEffect(() => {
    setPoint(0);
  }, []);

  return (
    <>
      <img src="./logo.png" alt="Bird" className="logo" />
      <img
        src={back[numberBackground]}
        alt="background"
        className="store-page"
      />
      <img src={down[numberDown]} alt="down" className="store-down" />
      <div className="home-page">
        <img
          src="./start.png"
          alt="start m"
          onClick={() => navigate("/home")}
          className="start"
        />
        <img
          src="./rate0.png"
          alt="rate m"
          className="rate"
          onClick={() => navigate("/leader")}
        ></img>
      </div>
    </>
  );
}

export default Home;
