// commonDate.js
import React, { createContext, useEffect, useState } from 'react';
import PageA from '../pages/PageA';
import PageB from '../pages/PageB';
import PageC from '../pages/PageC';
import PageD from '../pages/PageD';

export const DateTimeContext = createContext(); 

export const DateTimeProvider = ({ children }) => {
  function getRandomDateIn2021() {
      const start = new Date('2021-01-01T00:00:00Z');
      const end = new Date('2021-12-31T23:59:59Z');
	  const out = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	  out.setSeconds(0, 0);
      return out;
  }

  const [currentDateTime, setCurrentDateTime] = useState(getRandomDateIn2021());

  useEffect(() => {
    /*
      const syncTime = () => {
          const now = new Date(currentDateTime.getTime());
          const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
          setTimeout(() => {
              setCurrentDateTime(new Date(now.getTime() + 60000));
              syncTime();
          }, msUntilNextMinute);
      };

      syncTime();
      return () => clearTimeout(syncTime);
      */
      
    /*
    const intervalId = setInterval(() => {
        setCurrentDateTime(new Date(new Date().toISOString())); 
    }, 60000);

    return () => clearInterval(intervalId);
*/

const intervalId = setInterval(() => {
    setCurrentDateTime(prevDate => {
        const nextMinute = new Date(prevDate.getTime());
        nextMinute.setMinutes(prevDate.getMinutes() + 1);
        nextMinute.setSeconds(0);  // Explicitly set seconds to 0 to avoid second mismatch
        nextMinute.setMilliseconds(0); // Also zero out milliseconds for full precision
        return nextMinute;
    });
}, 60000);  // Trigger every minute

return () => clearInterval(intervalId);
  }, [currentDateTime]);

  return (
      <DateTimeContext.Provider value={{ currentDateTime, setCurrentDateTime }}>
          {children}
      </DateTimeContext.Provider>
  );
};


/*
export const CommonDate = () => {
  function getRandomDateIn2021() { // initializes time incrementing
		const start = new Date('2021-01-01T00:00:00Z');
		const end = new Date('2021-12-31T23:59:59Z');
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}
  
  const [currentDateTime, setCurrentDateTime] = useState(getRandomDateIn2021());

  useEffect(() => {
    function syncTime() {
        const now = new Date(currentDateTime.getTime());
        const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
        const timerId = setTimeout(() => {
            setCurrentDateTime(new Date(now.getTime() + 60000));
            syncTime();
        }, msUntilNextMinute);
    }

    syncTime();
    return () => clearTimeout(syncTime);
}, [currentDateTime]);

  return (
    <CommonDate.Provider value={{ currentDateTime, setCurrentDateTime }}>
     {children}
    </CommonDate.Provider>
   );
};

export default CommonDate;

*/