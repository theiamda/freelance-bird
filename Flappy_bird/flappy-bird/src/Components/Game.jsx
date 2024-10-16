import React, { useRef, useState, useEffect } from 'react';
import Bird from './Bird';
import './styles.css';
import Pipe from './Pipe';
import Counter from './Counter';
import { useNavigate } from 'react-router-dom';
import { useBird } from './BirdContext';
import axios from 'axios';

function Game() {
  const [isFalling, setIsFalling] = useState(true);
  const [currentY, setCurrentY] = useState(0);
  const [isThere, setIsThere] = useState(false);
  const [isThereTwice, setIsThereTwice] = useState(false);
  const [pipePosition, setPipePosition] = useState(0);
  const [pipePositionTwice, setPipePositionTwice] = useState(0);
  const [pipePositionThird, setPipePositionThird] = useState(0);
  const [isArise, setIsArise] = useState(true);
  const [start, setStart] = useState(false)
  const [gameOver, setGameOver] = useState(false);
  const {point, setPoint, ariseC, setAriseC} = useBird()
  const {countHeart, setCountHeart} = useBird()

  const navigate = useNavigate()

  const ref = useRef([]);
  const refTwice = useRef([]);
  const refThird = useRef([]);
  const birdRef = useRef();
  
  // Track passing status for each pipe
  const hasPassedPipe = useRef([false, false, false]);

  // Проверка выхода труб за пределы видимости
  const checkIfOutOfViewf = () => {
    if (ref.current[0]) {
      const rect = ref.current[0].getBoundingClientRect();
      if (rect.x < -45) {
        setPipePosition(generateRandomPipePosition());
      }
    }
  };

  // Проверка прохождения труб
  const getPoint = () => {
    if (birdRef.current) {
      const birdRect = birdRef.current.getBoundingClientRect();
      const pipeRefs = [ref.current[3], refTwice.current[3], refThird.current[3]];

      pipeRefs.forEach((pipe, index) => {
        if (pipe) {
          const pipeRect = pipe.getBoundingClientRect();
          if (birdRect.x > pipeRect.x && !hasPassedPipe.current[index]) {
            setPoint((prev) => prev + 1); // Увеличиваем счет
            hasPassedPipe.current[index] = true; // Отмечаем трубу как пройденную
          }

          if (pipeRect.x < -45) {
            hasPassedPipe.current[index] = false; // Сбрасываем статус при выходе трубы за экран
          }
        }
      });
    }
  };

  // Проверка столкновения между птицей и трубами
  const checkCollision = () => {
    if (birdRef.current) {
      const birdRect = birdRef.current.getBoundingClientRect();
      const pipeRefs = [
        ref.current[1], ref.current[2],
        refTwice.current[1], refTwice.current[2],
        refThird.current[1], refThird.current[2]
      ];

      for (const pipe of pipeRefs) {
        if (pipe) {
          const pipeRect = pipe.getBoundingClientRect();
          const isColliding =
            birdRect.x < pipeRect.x + pipeRect.width &&
            birdRect.x + birdRect.width > pipeRect.x &&
            birdRect.y < pipeRect.y + pipeRect.height &&
            birdRect.y + birdRect.height > pipeRect.y;

          if (isColliding) {
            setGameOver(true);
            break; // Выходим из цикла при первом столкновении
          }
        }
      }
    }
  };

  // Проверка выхода труб за пределы видимости
  const checkIfOutOfViewTwice = () => {
    if (refTwice.current[0]) {
      const rect = refTwice.current[0].getBoundingClientRect();
      if (rect.x < -45) {
        setPipePositionTwice(generateRandomPipePositionTwice());
      }
    }
  };

  const checkIfOutOfViewThird = () => {
    if (refThird.current[0]) {
      const rect = refThird.current[0].getBoundingClientRect();
      if (rect.x < -45) {
        setPipePositionThird(generateRandomPipePositionThird());
      }
    }
  };

  // Основной цикл обновления игры
  useEffect(() => {
    if(start){
    const intervalId = setInterval(() => {
      checkIfOutOfViewf();
      checkIfOutOfViewTwice();
      checkIfOutOfViewThird();
      checkCollision();
      getPoint();
    }, 105);

    return () => clearInterval(intervalId);
    }
  }, [start]);

  // Генерация случайной позиции трубы
  const generateRandomPipePosition = () => Math.floor(Math.random() * -185) - 50;
  
  // Генерация случайной позиции второй трубы
  const generateRandomPipePositionTwice = () => Math.floor(Math.random() * -185) - 50;

   // Генерация случайной позиции третьей трубы
   const generateRandomPipePositionThird = () => Math.floor(Math.random() * -185) - 50;

   // Падение птицы
   useEffect(() => {
     const fallInterval = setInterval(() => {
       if (isFalling) {
         setCurrentY((prevY) => Math.min(prevY + 16, window.innerHeight - 210));
       }
     }, 50);

     return () => clearInterval(fallInterval);
   }, [isFalling]);

   // Обработка клика по фону
   const handleBackgroundClick = () => {
     if (isFalling) {
       setIsFalling(false); 
       setCurrentY((prevY) => Math.max(prevY - 100, -200)); 

       // Возобновляем падение через небольшую задержку
       setTimeout(() => {
         setIsFalling(true); 
       }, 120); 
     }
   };

   const updateHeartCount = async () => {
    setCountHeart((prev) => prev - 1);

    const fetchID = async () => {
      try {
          const response = await axios.get('http://localhost:3000/dataall');
          return response.data.id;
      } catch (error) {
          console.error("Error fetching data:", error);
          throw error;
      }
    };

    const fetchedChatId = await fetchID(); // Получаем chatId
    
    const response = await axios.post('http://localhost:3000/arise', { chatId: fetchedChatId }); // Pass chatid here
    console.log(response.data); // Log success message

};

   // Обработка клика по кнопке "Arise" 
   const handleAriseClick = () => {
     setIsThere(false);
     setIsThereTwice(false);
     setCurrentY(10)
     setGameOver(false);
     setAriseC((prev) => prev + 1)

     setIsArise(true)

     updateHeartCount()

     for (let i = 0; i < hasPassedPipe.current.length; i++) {
       hasPassedPipe.current[i] = false;
     }

     // Установка таймеров для появления труб с задержкой
     setTimeout(() => { 
       setIsThere(true); 
     }, 900);

     setTimeout(() => { 
       setIsThereTwice(true); 
     }, 1800);
   };

     // Функция для сброса состояния игры
  const resetGame = () => {
    setIsFalling(true);
    setCurrentY(10);
    setIsThere(false);
    setIsThereTwice(false);
    setPipePosition(0);
    setPipePositionTwice(0);
    setPipePositionThird(0);
    setGameOver(false);
    setPoint(0);
    setAriseC(0)

    // Сбрасываем статус прохождения труб
    hasPassedPipe.current.fill(false);

    // Запускаем таймеры для появления труб
    startPipes();
  };

  // Запуск таймеров для появления труб
  const startPipes = () => {
    setTimeout(() => {
      setIsThere(true); 
    }, 900);

    setTimeout(() => {
      setIsThereTwice(true); 
    }, 1800);
  };

  const sendDataToBackend = async () => {
    try {
        // Сначала получаем текущий счет из базы данных
        const response = await axios.get(`http://localhost:3000/data`); // Передайте chatId, если необходимо
        const currentScore = response.data.score; // Предполагается, что вы возвращаете score из /data

        // Проверяем, если новый счет меньше или равен текущему
        if (point <= currentScore) {
            console.log('Новый счет не выше текущего. Данные не отправлены.');
            return; // Не отправляем данные
        }

        // Если новый счет больше, отправляем его на сервер
        const updateResponse = await axios.post('http://localhost:3000/updateScore', {
            score: point,
        });

        console.log('Data sent successfully:', updateResponse.data);

        // Сначала получаем текущий счет из базы данных
        const responseWeek = await axios.get(`http://localhost:3000/dataweek`); // Передайте chatId, если необходимо
        const currentScoreWeek = responseWeek.data.score; // Предполагается, что вы возвращаете score из /data

        // Проверяем, если новый счет меньше или равен текущему
        if (point <= currentScoreWeek) {
            console.log('Новый счет не выше текущего. Данные не отправлены.');
            return; // Не отправляем данные
        }

        // Если новый счет больше, отправляем его на сервер
        const updateResponseWeek = await axios.post('http://localhost:3000/updateScoreweek', {
            score: point,
        });

        console.log('Data sent successfully:', updateResponseWeek.data);


    } catch (error) {
        console.error('Error sending data:', error);
    }
};

  useEffect(() => {
    if(gameOver) {
      sendDataToBackend()
    }
  }, [gameOver])

   const store = () => {
    setAriseC(0)
    navigate('/store')
  }

   const { numberBackground, back, down, numberDown } = useBird()

   const handleStart = () => {
    setStart(true)
    setIsFalling(true);
    setCurrentY(10);
    setIsThere(false);
    setIsThereTwice(false);
    setPipePosition(0);
    setPipePositionTwice(0);
    setPipePositionThird(0);
    setGameOver(false);
    setPoint(0);
    setAriseC(0)

    // Сбрасываем статус прохождения труб
    hasPassedPipe.current.fill(false);

    // Запускаем таймеры для появления труб
    startPipes();
   }

   return (
     <>
       {gameOver ?     
         <>
        <div className='heart-container'>
            <h1 className='count-of-heart'>{countHeart}</h1>
          <img className='heart-img' src="./heartimg.png" alt="heart" />
        </div>
           <div className='point-container'>
             <h1 className='point'>{point}</h1>      
             <img src="./gold.png" alt="gold" className='gold-medal' />
             <img src="./res.png" alt="res" className='res-tabl' />
           </div>
           
           <img src={back[numberBackground]} alt='background' className='store-page'/>
           <img src={down[numberDown]} alt="down" className='store-down' />
           
          <img src="./gameover.png" alt="gameover" className='gameover-png' />
          <div className='btns'>
               {countHeart === 0 || ariseC === 2 ? <div></div> :
              <img src='./arise2.png' alt='arise' className='arise btn' onClick={handleAriseClick}/>}
              <img src='./start2.png' alt='start' className='exit btn' onClick={resetGame}/>
              <img src="./menu2.png" alt="menu" className='store btn' onClick={store}/>       
           </div>
         </> : ( start ?
         <div>
           <div className='clickable-div' onClick={handleBackgroundClick}></div>
           <div className='heart-container'>
            <h1 className='count-of-heart'>{countHeart}</h1>
          <img className='heart-img' src="./heartimg.png" alt="heart" />
        </div>
           <Counter point={point}></Counter>
           <div className='background'>
            {numberBackground === 0 ? <div> <div className='background-layer background-layer-1'/>
             <div className='background-layer background-layer-2'/> </div> 
              : (numberBackground === 1 ? <div> <div className='backgroundnight-layer background-layer-1'/>
             <div className='backgroundnight-layer background-layer-2'/> </div> : <div> <div className='backgroundmush-layer background-layer-1'/>
             <div className='backgroundmush-layer background-layer-2'/> </div>)}

             {numberDown === 0 ? <div> <div className='down-layer down-layer-1'/>
             <div className='down-layer down-layer-2'/> </div> 
              : (numberDown === 1 ? <div> <div className='downnight-layer down-layer-1'/>
             <div className='downnight-layer down-layer-2'/> </div> : <div> <div className='downmush-layer down-layer-1'/>
             <div className='downmush-layer down-layer-2'/> </div>)}

             <Pipe ref={ref} position_pipe_container={pipePosition}></Pipe>
             {isThere && <Pipe ref={refTwice} position_pipe_container={pipePositionTwice}></Pipe>} 
             {isThereTwice && <Pipe ref={refThird} position_pipe_container={pipePositionThird}></Pipe>} 
           </div>
           <Bird ref={birdRef} currentY={currentY} isFalling={isFalling} />      
         </div> 
         : <>
         <div className='click-start' onClick={handleStart}></div>
         <img src={back[numberBackground]} alt='background' className='store-page'/>
         <img src={down[numberDown]} alt="down" className='store-down' />
         <div className='tap-con'>
         <img src="./tap1.png" alt="tap" className='tap1'/>
         <img src="./tap.png" alt="tap" className='tap'/>
         <img src="./tap2.png" alt="tap" className='tap2'/>          
         </div>

         </>)}
     </>
   );
}

export default Game;