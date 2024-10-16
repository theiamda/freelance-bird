import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Bird from './Bird';
import { useBird } from './BirdContext';
import axios from 'axios'

function Store() {

  const { number, setNumber, setCountHeart, countHeart } = useBird();

  const [choose, setChoose] = useState([false, false, false])
  
  
  const navigate = useNavigate();

  const handleFirstClick = () => {
    setNumber(1);
  }

  const handleSecondClick = () => {
    setNumber(0);
  }

  const handleThirdClick = () => {
    setNumber(2);
  }

  const handleFouthClick = () => {
    setNumber(3)
  }

  const handleFiveClick = () => {
    setNumber(4)
  }

  const handleBuyOneHeart = async () => {
    await handleCreateInvoice()
    
    const fetchone = async () => {
      try {
        await axios.get('http://localhost:3000/updHone');
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Rethrow error to handle it in the calling function
    }
    }

     await fetchone()
  }

  const handleBuyFiveHeart = async () => {
    await handleCreateInvoiceo()

    const fetchtwo = async () => {
      try {
        await axios.get('http://localhost:3000/updHtwo');
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Rethrow error to handle it in the calling function
    }
    }

    await fetchtwo()

  }

  const handleCreateInvoice = async () => {
    try {
        const fetchedChatId = await fetchID(); // Получаем chatId
        console.log('Fetched Chat ID:', fetchedChatId); // Для отладки
        
        const response = await axios.post('http://localhost:3000/create-invoice', { chatId: fetchedChatId });
        console.log('Invoice Creation Response:', response.data); // Для отладки

        if (response.data.invoiceLink) {
          window.Telegram.WebApp.openInvoice(response.data.invoiceLink);
          console.log('Opened Invoice Link:', response.data.invoiceLink);
        }
    } catch (error) {
        console.error("Error creating invoice:", error);
        alert(`Ошибка: ${error}`); // Показываем сообщение об ошибке
    }
  };

  const { numberBackground, setNumberBackground, back, down, setNumberDown, numberDown } = useBird()

  const handleSkyBackground = () => {
    setNumberBackground(0)
    setNumberDown(0)
  }

  const handleNightBackground = () => {
    setNumberBackground(1)
    setNumberDown(1)
  }

  const handleMushBackground = () => {
    setNumberBackground(2)
    setNumberDown(2)
  }

  const handleBuyB = () => {
    handleCreateInvoice()
    
    const fetchOne = async () => {
      try {
        await axios.get('http://localhost:3000/updOne');
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Rethrow error to handle it in the calling function
    }
    }

    fetchOne()

  }

  const handleBuy = () => {
    handleCreateInvoice()
    
    const fetchBack = () => {
      try {
        axios.get('http://localhost:3000/updBack');
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Rethrow error to handle it in the calling function
    }
    }

    fetchBack()

  }

  const handleBuyBf = () => {
    handleCreateInvoice()

    const fetchTwo = () => {
      try {
        axios.get('http://localhost:3000/updTwo');
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Rethrow error to handle it in the calling function
    }
    }

    fetchTwo()
  }

  const fetchID = async () => {
    try {
        const response = await axios.get('http://localhost:3000/dataall');
        return response.data.id;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
  };

  const handleCreateInvoiceo = async () => {
    try {
        const fetchedChatId = await fetchID(); // Получаем chatId
        console.log('Fetched Chat ID:', fetchedChatId); // Для отладки
        
        const response = await axios.post('http://localhost:3000/create-invoiceo', { chatId: fetchedChatId });
        console.log('Invoice Creation Response:', response.data); // Для отладки

        if (response.data.invoiceLink) {
          window.Telegram.WebApp.openInvoice(response.data.invoiceLink);
          console.log('Opened Invoice Link:', response.data.invoiceLink);
        }
    } catch (error) {
        console.error("Error creating invoice:", error);
        alert(`Ошибка: ${error}`); // Показываем сообщение об ошибке
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/dataall');

            const birdone = response.data.birdone; 
            const birdtwo = response.data.birdtwo; 
            const back = response.data.back;

            if (birdone === 1) {
                setChoose(prevChoose => {
                    const newChoose = [...prevChoose];
                    newChoose[1] = true;
                    return newChoose;
                });
            }

            if (birdtwo === 1) {
                setChoose(prevChoose => {
                    const newChoose = [...prevChoose];
                    newChoose[2] = true;
                    return newChoose;
                });
            }

            if (back === 1) {
                setChoose(prevChoose => {
                    const newChoose = [...prevChoose];
                    newChoose[0] = true;
                    return newChoose;
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Выполняем fetchData сразу при монтировании
    fetchData();

    // Устанавливаем интервал для выполнения fetchData каждые 40 секунд
    const intervalId = setInterval(fetchData, 40000);

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
}, []);


  return (
    <>
      <div className='hide'>
        <Bird />
      </div>

      <img src={back[numberBackground]} alt='background' className='store-page'/>
      <img src={down[numberDown]} alt="down" className='store-down' />
        <button className='back' onClick={() => navigate('/')}>BACK</button>
        
        <div className="backgrounds">
          <div className="background-skin">
            <img src="./backgroundcity.png" alt="sky" className='sky' />
            {numberBackground === 0 ? <button className='bought'>выбрано</button> : <button onClick={handleSkyBackground} className='buy'>выбрать</button>}
          </div>
          <div className="background-skin">
            <img src="./backgroundforest.png" alt="sky" className='sky' />
            {numberBackground === 1 ? <button className='bought'>выбрано</button> : <button className='buy' onClick={handleNightBackground}>выбрать</button>}
          </div>
          <div className="background-skin">
            <img src="./backgroundmush.png" alt="sky" className='sky' />
            {choose[0] ? (numberBackground === 2 ? <button className='bought'>выбрано</button> : <button className='buy' onClick={handleMushBackground}>выбрать</button>) : <button className='buy' onClick={handleBuy}>купить</button>}
          </div>
        </div>
        <div className='skins'>
        <div className='product'>
            <img src="./bird1.png" alt="Special Bird" className='bird-image' />
            {number === 0 ? ( // Проверяем, куплена ли птица
              <button className='bought'>выбрано</button>
            ) : (
              <button onClick={handleSecondClick} className='buy'>выбрать</button> // Передаем функцию без вызова
            )}
          </div>
          <div className='product'>
            <img src="./bird2.png" alt="Special Bird" className='bird-image' />
            {number === 1 ? (
              <button className='bought'>выбрано</button>
            ) : (
              <button onClick={handleFirstClick} className='buy'>выбрать</button>
            )}
          </div>

          <div className='product'>
            <img src="./bird3.png" alt="Special Bird" className='bird-image' />
            {number === 2 ? (
              <button className='bought'>выбрано</button>
            ) : (
              <button onClick={handleThirdClick} className='buy'>выбрать</button> // Передаем функцию без вызова
            )}
          </div>

          <div className='product'>
            <img src="./bird4.png" alt="Special Bird" className='bird-image' />
            {choose[1] ? (number === 3 ? (
              <button className='bought'>выбрано</button>
            ) : (
              <button onClick={handleFouthClick} className='buy'>выбрать</button> // Передаем функцию без вызова
            )) : <button onClick={handleBuyB} className='buy'>купить</button>}
          </div>

          <div className='product'>
            <img src="./bird5.png" alt="Special Bird" className='bird-image' />
            {choose[2] ? (number === 4 ? (
              <button className='bought'>выбрано</button>
            ) : (
              <button onClick={handleFiveClick} className='buy'>выбрать</button> // Передаем функцию без вызова
            )) : <button onClick={handleBuyBf} className='buy'>купить</button>}
          </div>
        </div>

        <div className='hearts'>
          <div className='plus-one'>
            <div>
              <img src="./heartimg.png" alt="heart" className='heart-buy'/>
              <span className='plus-text'>+1</span>            
            </div>

            <button onClick={handleBuyOneHeart} className='buy'>Купить</button>
          </div>
          <div className='plus-one'>
            <div>
              <img src="./heartimg.png" alt="heart" className='heart-buy'/>
              <span className='plus-text'>+5</span>            
            </div>

            <button onClick={handleBuyFiveHeart} className='buy'>Купить</button>
          </div>
        </div>
    </>
  );
}

export default Store;