import express from 'express';
import { postSearch, getSearchesByUser } from './search.controller';
import { auth } from '../../middlewares/auth';


const router = express.Router();

router
    .route("/")
    .post(auth('user'), postSearch);


router.get('/:user_id', auth('user'), getSearchesByUser)


export const SearchRoutes = router;
