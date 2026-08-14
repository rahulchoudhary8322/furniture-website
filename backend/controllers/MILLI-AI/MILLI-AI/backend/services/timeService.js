export const getCurrentTime = () => {

  const now = new Date();

  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

};