import { Router } from 'express';
import User from '/server/models/user';
import Helper from '/server/middleware/data-validation';
import validate from '/shared/validation/userValidation';
import { doGet, doPut, doDelete } from '/server/middleware';
import { scheduler } from '/server';
import { ReadWriteTask } from 'async-task-schedulers';
import { fetchDocumentById, getDocumentById } from '/server/middleware/data-validation';

const router = Router();

// all routes have the base url /api/users

router.route('/')
	.post((req, res, next) => {
		const asyncFunction = async function(req, res, next) {
			const { errors, isValid } = validate(req.body);
			if (!isValid) {
				return next({ status: 400, message: 'Invalid user data', errors });
			}
			
			let user;
			try {
				user = await new User(req.body).save();
			} catch (err) {
				if (err.name === 'ValidationError') {
					const errors = {};
					for (let field in err.errors) {
						errors[field] = 'This ' + field + ' is taken';
					}
					next({ status: 409, errors }); //ooh baby that object spread
				} else {
					next({ status: 400, message: err.message });
				}
				return;
			}
			
			res.status(201).json({ id: user._id });
		};
		scheduler.push(new ReadWriteTask(asyncFunction, [req, res, next], true));
	});

router.route('/:userId')
	.get((req, res, next) => {
		const asyncFunction = async function(req, res, next) {
			let user;
			if (!(user = await fetchDocumentById(User, req.params.userId, '', next))) {
				return;
			}
			
			res.status(200).json(user);
		};
		scheduler.push(new ReadWriteTask(asyncFunction, [req, res, next], false));
	});

router.route('/:userId/locations')
	.get((req, res, next) => {
		const asyncFunction = async function(req, res, next) {
			let user;
			if (!(user = await getDocumentById(req, User, req.params.userId, 'locations', next))) {
				return;
			}
			
			res.status(200).json(user.locations);
		};
		scheduler.push(new ReadWriteTask(asyncFunction, [req, res, next], false));
	});

export default router;
