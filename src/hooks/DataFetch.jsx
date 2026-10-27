import React, { createContext, useContext, useState, useEffect } from "react";
// Create a context to hold the fetched data
const DataContext = createContext();
// Create a custom hook to consume the context
export const useData = () => useContext(DataContext);

// Create a provider component to wrap your application and provide the data
export const DataProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cached = localStorage.getItem("category");
        const cacheTimestamp = localStorage.getItem("category_timestamp");
        const oneDayInMs = 6 * 60 * 60 * 1000; // 6-hour minutes in milliseconds

        if (cached && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < oneDayInMs) {
            setPosts(JSON.parse(cached));
            setLoader(false);
            return; // Use cached data
          }
        }
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbw1iX5AdD32YcXYohQLAgEx3SDPTsH3V41RGCGts2bNk3-yYfSlEpZgufNt-G60gc7t/exec`,
        );
        const posts = await response.json();
        setPosts(posts);
        // Save with timestamp
        localStorage.setItem("category", JSON.stringify(posts));
        localStorage.setItem("category_timestamp", Date.now().toString());

        setLoader(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoader(false);
      }
    }

    load();
  }, []);

  return <DataContext.Provider value={{ posts, loader }}>{children}</DataContext.Provider>;
};
