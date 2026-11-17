import React, { createContext, useContext, useState, useEffect } from "react";
// Create a context to hold the fetched data
const SrcContext = createContext();
// Create a custom hook to consume the context
export const useSrc = () => useContext(SrcContext);

// Create a provider component to wrap your application and provide the data
export const SrcProvider = ({ children }) => {
  const [speedRunSrc, setSpeedRunSrc] = useState([]);
  const [loader2, setSrcLoader2] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cached = localStorage.getItem("src");
        const cacheTimestamp = localStorage.getItem("src_timestamp");
        const oneDayInMs = 6 * 60 * 60 * 1000; // 6-hours minutes in milliseconds

        if (cached && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < oneDayInMs) {
            setSpeedRunSrc(JSON.parse(cached));
            setSrcLoader2(false);
            return; // Use cached data
          }
        }
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbzhfKPdoACdnpXKIB7n8G3lOOonxxUIHHsENpOVjS1zB9GWdelUEs72md3z-pt8--0x/exec`,
        );
        const posts = await response.json();
        setSpeedRunSrc(posts);
        // Save with timestamp
        localStorage.setItem("src", JSON.stringify(posts));
        localStorage.setItem("src_timestamp", Date.now().toString());

        setSrcLoader2(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSrcLoader2(false);
      }
    }

    load();
  }, []);

  return <SrcContext.Provider value={{ speedRunSrc, loader2 }}>{children}</SrcContext.Provider>;
};
