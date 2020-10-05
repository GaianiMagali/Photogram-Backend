const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) return res.status(401).send({ error: "No autorizado" });
  
    const parts = authHeader.split(" ");
  
    if (parts.length !== 2)
      return res.status(401).send({ error: "Token error" });
  
    const [scheme, token] = parts;
  
    if (!/^Bearer$/i.test(scheme))
      return res.status(401).send({ error: "Token malformateado" });
  
    jwt.verify(token, process.env.SIGNATURE_TOKEN, (error, decode) => {
      if (error) return res.status(401).send({ error: "Token invalido" });
  
      req.userId = decode.id;
      return next();
    });
  };