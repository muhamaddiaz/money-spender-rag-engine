import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import aiRoutes from "./routes/aiRoutes";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hello TypeScript Express!');
});

app.use('/api/ai', aiRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

export default app;
