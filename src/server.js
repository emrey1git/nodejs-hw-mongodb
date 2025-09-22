import express from 'express';
import cors from 'cors';
import pino from 'pino-http';

import contactsRouter from './routers/contacts.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

import authRouter from './routers/authRouter.js';

// Swagger UI için eklemeler
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.send('Express sunucusu çalışıyor!');
  });

  // Swagger/OpenAPI dosyasını yükle
  const swaggerDocument = YAML.load('./docs/openapi.yaml');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  // 404 için sadece notFoundHandler kullanılır
  app.use(notFoundHandler);

  // Hata işleme middleware'i
  app.use(errorHandler);

  return app;
}
