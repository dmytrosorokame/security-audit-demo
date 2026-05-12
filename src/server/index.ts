import express from 'express';
import { proxyRouter } from './routes/proxy.js';
import { searchRouter } from './routes/search.js';
import { usersRouter } from './routes/users.js';

const app = express();
app.use(express.json({ limit: '100kb' }));

app.use('/api/proxy', proxyRouter);
app.use('/api/search', searchRouter);
app.use('/api/users', usersRouter);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`server listening on :${PORT}`);
});
