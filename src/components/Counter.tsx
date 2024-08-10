import React, { useState, useEffect } from "react";
import axios from "axios";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    try {
      const response = await axios.get("/api/count");
      setCount(response.data.count);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  const incrementCount = async () => {
    try {
      const response = await axios.post("/api/increment");
      setCount(response.data.count);
    } catch (error) {
      console.error("Error incrementing count:", error);
    }
  };

  return (
    <div className="card">
      <button onClick={incrementCount}>count is {count}</button>
    </div>
  );
}

export default Counter;
