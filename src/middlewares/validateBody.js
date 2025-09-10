const validateBody = (schema) => {
  return (req, res, next) => { // 'body' yerine 'res' kullanıldı
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  };
};

export default validateBody;
