import { Router } from 'express';
import {getEmbeddings, postSearch, postTrainModel} from "../controllers/aiController";

const router = Router();

router.post('/train', postTrainModel);
router.get('/embed', getEmbeddings);
router.post('/search', postSearch as any);

export default router;
