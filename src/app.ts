import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes';
import globalErrorhandler from './middlewares/globalErrorhandler';
const app = express()

//parsers
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3001",
  ], // Allow only this origin
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions));

//file retrieve
app.use(express.static('uploads'));

// ✅ Also parse URL-encoded form data, in case SSLCommerz sends as form
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Elite Task Backend')
})

app.use(globalErrorhandler)

//not found route
// app.use(notFound)

export default app;