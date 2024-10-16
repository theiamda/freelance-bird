import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBird } from './BirdContext';
import axios from 'axios';

function Leaderboard() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [week, setWeek] = useState([])
    const [id, setId] = useState(0)
    const { numberBackground, back, down, numberDown } = useBird();

    useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await axios.get('http://localhost:3000/data');
              setData(response.data); // Устанавливаем массив пользователей
              const weekResponse = await axios.get('http://localhost:3000/dataweek');
              setWeek(weekResponse.data)
          } catch (error) {
              console.error("Error fetching data:", error);
          }
      };

      fetchData();

      const fetchID = async () => {
        try {
            const response = await axios.get('http://localhost:3000/dataall');
            return response.data.id; // Return the chatId
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error; // Rethrow error to handle it in the calling function
        }
      };

      fetchID().then(setId); // Устанавливаем id после получения
  }, []);

  const [selectedOption, setSelectedOption] = useState('day');

  const handleChange = (event) => {
      setSelectedOption(event.target.value);
  };

  const limitedData = data.slice(0, 20);
  const limitedWeek = week.slice(0, 20);

    // Находим пользователя по id
    const currentUserData = data.find(user => user.id === id);
    const currentUserWeekData = week.find(user => user.id === id);


  return (
    <>
      <button className='back' onClick={() => navigate('/')}>BACK</button>
      <img src={back[numberBackground]} alt='background' className='store-page'/>
      <img src={down[numberDown]} alt="down" className='store-down' />
      <h1 className='leader-title'>Top 20 players of 
        <select className='select' name="day" id="day" value={selectedOption} onChange={handleChange} >
            <option className='day' value="day">day</option>
            <option className='week' value="week">week</option>
        </select>
    </h1>
    { selectedOption === 'day' &&
      <div className='leaderboard'>
      <ol>
          {limitedData.map((user, index) => (
              <li key={index}>
                  {index === 0 ? <div style={{backgroundColor: 'gold'}} className="rank-con"><span className="rank">{index + 1}</span></div> : <div className="rank-con"><span className="rank">{index + 1}</span></div>}
                  <div className="name-con"><span className="name">{user.username}</span></div>
                  <span className='points'>{user.score}</span>
              </li>
              
          ))}
      </ol>
      {currentUserData && (
            <div className='perp'>
                <li>
                <div className="rank-con">
                    <span className="rank">-</span> {/* Позиция после ограниченного списка */}
                </div>
                <div className="name-con">
                    <span className="name">{currentUserData.username}</span>
                </div>
                <span className='points'>{currentUserData.score}</span>
            </li>            
            </div>

                    )}
      </div>        
    }{selectedOption === 'week' && 
        <div className='leaderboard'>
        <ol>
            {limitedWeek.map((user, index) => (
                <li key={index}>
                    {index === 0 ? <div style={{backgroundColor: 'gold'}} className="rank-con"><span className="rank">{index + 1}</span></div> : <div className="rank-con"><span className="rank">{index + 1}</span></div>}
                    <div className="name-con"><span className="name">{user.username}</span></div>
                    <span className='points'>{user.score}</span>
                </li>
                
            ))}

        </ol>

        {currentUserWeekData && (
            <div className='perp'>
                <li>
                <div className="rank-con">
                    <span className="rank">-</span> {/* Позиция после ограниченного списка */}
                </div>
                <div className="name-con">
                    <span className="name">{currentUserWeekData.username}</span>
                </div>
                <span className='points'>{currentUserWeekData.score}</span>
            </li>            
            </div>

                    )}
        </div>       
    }

    </>
  )
}

export default Leaderboard