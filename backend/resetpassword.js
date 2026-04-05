const bcrypt = require("bcrypt");

(async () => {
  const password = "chandel@123"; 

  const hash = await bcrypt.hash(password, 10);

  console.log("Your new hashed password:");
  console.log(hash);
})();