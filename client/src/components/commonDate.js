import React, { createContext, useEffect, useState } from 'react';

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
  const intervalId = setInterval(() => {
    setCurrentDateTime(prevDate => {
        const nextMinute = new Date(prevDate.getTime());
        nextMinute.setMinutes(prevDate.getMinutes() + 1);
        nextMinute.setSeconds(0);
        nextMinute.setMilliseconds(0);
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