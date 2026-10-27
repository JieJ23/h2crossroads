import React, { createContext, useContext, useState, useEffect } from "react";
// Create a context to hold the fetched data
const PfpContext = createContext();
// Create a custom hook to consume the context
export const usePfp = () => useContext(PfpContext);

// Create a provider component to wrap your application and provide the data
export const PfpProvider = ({ children }) => {
  const [pfp, setPfp] = useState([]);
  const [pfploader, setPfpLoader] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cached = localStorage.getItem("pfp");
        const cacheTimestamp = localStorage.getItem("pfp_timestamp");
        const oneDayInMs = 6 * 60 * 60 * 1000; // 6-hours minutes in milliseconds

        if (cached && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < oneDayInMs) {
            setPfp(JSON.parse(cached));
            setPfpLoader(false);
            return; // Use cached data
          }
        }
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbx_hseU8ikQOqJxTol9apUzW-8j5EkZqIE6acAI3lURJxqD0cm_96UD_3iMtS279Iit/exec`,
        );
        const posts = await response.json();
        setPfp(posts);
        // Save with timestamp
        localStorage.setItem("pfp", JSON.stringify(posts));
        localStorage.setItem("pfp_timestamp", Date.now().toString());

        setPfpLoader(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setPfpLoader(false);
      }
    }

    load();
  }, []);

  return <PfpContext.Provider value={{ pfp, pfploader }}>{children}</PfpContext.Provider>;
};
