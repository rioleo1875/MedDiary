const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Backend test running");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
