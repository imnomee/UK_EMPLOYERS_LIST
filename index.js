import express from 'express';
import dotenv from 'dotenv';
import empRoutes from './emp.routes.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/v1/list', empRoutes);

app.use('*', (req, res, next) => {
    return res.status(404).json('not found: 404');
});

app.use((err, req, res, next) => {
    return res.status(500).json('something went wrong: 500');
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on: ${PORT}`);
});
