// This file is now replaced by lottery.jsx
// Keeping for backward compatibility but redirecting to lottery page
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Scores() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/lottery");
  }, [navigate]);

  return null;
}