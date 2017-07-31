/**
 * Helper functions and middleware for data validation
 * @namespace data-validation
 * @memberof server.middleware
 */

import mongoose from 'mongoose';
import Crop from '/server/models/crop';
import Companionship from '/server/models/companionship';
import User from '/server/models/user';
import Location from '/server/models/location';

import * as myself from './data-validation';
export default myself;

/**
 * Express middleware function
 * Checks each id in req.ids to see if it is a valid ObjectId. If not, sends a 400 error to the client
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be checked
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export function idValidator(req, res, next) {
	const ids = req.ids;
	if (typeof ids === 'undefined') {
		next();
	} else {
		const valid = ids.every(mongoose.Types.ObjectId.isValid);

		if (valid) {
			next();
		} else {
			const err = new Error();
			err.status = 400;
			err.message = 'Malformed object ID';
			next(err);
		}
	}
}

/**
 * Processes an array of companionships and calculates compatibility scores for each possible crop
 * @param  {Companionship[][]} companionshipTable table of sets of Companionships for each crop in ids. All companionships for ids[i] are stored in companionshipTable[i]
 * @param  {ObjectId[]} ids       ids of crops used to fetch each Companionship.
 * @return {Object}           Object mapping crop ids to companionship scores
 */
export function getCompanionshipScores(companionshipTable, ids) {
	// create an intersection of the companionship companionshipTable
	// crops with any negative interactions will have a value of 0
	// all other crops will give a percentage score which is how many they complement in the set
	const result = {};
	const maxScore = Companionship.schema.paths.compatibility.options.max;
	const maxTotal = maxScore * companionshipTable.length;
	for (let i = 0; i < ids.length; i++) {
		const data = companionshipTable[i];
		const queryId = ids[i];
		data.forEach(pair => {
			// look at the one that is NOT the corresponding id in ids
			// at the same index as the current snapshot
			// Because the current data is for the snapshot for a single crop
			const id = pair.crop2.equals(queryId) ? pair.crop1 : pair.crop2;

			// building the companionship scores, storing in result
			// if a companion crop is incompatible with any query crop, its score will be -1
			// otherwise, it will be the average of all of its compatiblity scores with the query crops
			if (pair.compatibility === -1) {
				result[id] = -1;
			} else if (pair.compatibility !== -1 && result.hasOwnProperty(id)) {
				if (result[id] != -1) {
					result[id] += pair.compatibility / maxTotal;
				}
			} else {
				result[id] = pair.compatibility / maxTotal;
			}
		});
	}
	return result;
}

/**
 * Express middleware function generated by {@link data-validation.fetchModel}
 * Fetches all Crops associated with ids in req.ids and stores them in req.crops
 * If a crop does not exist, it will send a 404 to the client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be fetched
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const fetchCrops = fetchModel(Crop, 'crops');

/**
 * Express middleware function generated by {@link data-validation.fetchModel}
 * Same as {@link data-validation.fetchCrops}, but also populates the companionships of each crop with full Companionship objects, rather than just ids
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be fetched
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const fetchCropsWithCompanionships = fetchModel(
	Crop,
	'crops',
	'companionships'
);

/**
 * Expres middleware function generated by {@link data-validation.checkModel}
 * Checks that each crop associated with an id in req.ids exists.
 * If one doesn't exist, sends 404 to client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be checked
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const checkCrops = checkModel(Crop);

/**
 * Express middleware function generated by {@link data-validation.fetchModel}
 * Fetches all Companionships associated with ids in req.ids and stores them in req.companionships
 * Also populates crop1 and crop2 with Crop objects
 * If a companionship does not exist, it will send a 404 to the client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be fetched
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const fetchCompanionships = fetchModel(
	Companionship,
	'companionships',
	'crop1 crop2'
);

/**
 * Expres middleware function generated by {@link data-validation.checkModel}
 * Checks that each companionship associated with an id in req.ids exists.
 * If one doesn't exist, sends 404 to client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be checked
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const checkCompanionships = checkModel(Companionship);

/**
 * Express middleware function generated by {@link data-validation.fetchModel}
 * Fetches all Users associated with ids in req.ids and stores them in req.users
 * If a user does not exist, it will send a 404 to the client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be fetched
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const fetchUsers = fetchModel(User, 'users');

/**
 * Expres middleware function generated by {@link data-validation.checkModel}
 * Checks that each user associated with an id in req.ids exists.
 * If one doesn't exist, sends 404 to client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be checked
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const checkUsers = checkModel(User);

/**
 * Express middleware function generated by {@link data-validation.fetchModel}
 * Fetches all Locations associated with ids in req.ids and stores them in req.locations
 * If a location does not exist, it will send a 404 to the client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be fetched
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const fetchLocations = fetchModel(Location, 'locations');

/**
 * Expres middleware function generated by {@link data-validation.checkModel}
 * Checks that each location associated with an id in req.ids exists.
 * If one doesn't exist, sends 404 to client
 * @function
 * @param  {Object}   req -  request object
 * @param {String[]} req.ids - List of ids to be checked
 * @param  {Object}   res  response object
 * @param  {Function} next callback to next function
 * @return {None}
 */
export const checkLocations = checkModel(Location);

/**
 * A function factory to generate express middleware for fetching models. See {@link data-validation.fetchCrops} for specifications
 * of generated function
 * @param  {Mongoose.Model} model      Model type to be fetched
 * @param  {String} resultName name of the property in the request object where the fetched models will be stored
 * @param  {String} [populate='']   fields in the fetched models to populate
 * @return {Function}
 */
export function fetchModel(model, resultName, populate = '') {
	return (req, res, next) => {
		if (typeof req.ids === 'undefined') {
			next();
			return;
		}
		req[resultName] = [];
		req.ids.forEach(id => {
			let query = model.findById(id);
			if (populate !== '') {
				query = query.populate(populate);
			}
			query.exec((err, item) => {
				if (item !== null) {
					req[resultName].push(item);
					if (req[resultName].length === req.ids.length) {
						// finished fetching crops
						next();
						return;
					}
				} else {
					const error = new Error();
					error.status = 404;
					error.message = 'No ' + resultName + ' with this ID found';
					next(error);
					return;
				}
			});
		});
	};
}

/**
 * Function factory to generate express middleware for checking if some ids exist in a model without fetching them
 * See {@link checkCrops} for specifications of generated middleware
 * @param  {Mongoose.Model} model model type to check
 * @return {Function}       express middleware function
 */
export function checkModel(model) {
	return (req, res, next) => {
		if (typeof req.ids === 'undefined') {
			next();
			return;
		}
		let counter = 0;
		req.ids.forEach(id => {
			model.count({ _id: id }, function(err, count) {
				if (count > 0) {
					counter += 1;
					if (counter === req.ids.length) {
						next();
					}
				} else {
					next({ status: 404 });
					return;
				}
			});
		});
	};
}

/**
 * Converts a string into regex-friendly format, escaping all regex special characters
 * @param  {String} text string to convert
 * @return {String}      escaped string
 */
export function escapeRegEx(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
