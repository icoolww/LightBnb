// const properties = require('./json/properties.json');
// const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb',
});

/// Users
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      if (result.rows) {
        console.log(result.rows[0]);
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithEmail = getUserWithEmail;

// let user;
// for (const userId in users) {
//   user = users[userId];
//   if (user.email.toLowerCase() === email.toLowerCase()) {
//     break;
//   } else {
//     user = null;
//   }
// }
// return Promise.resolve(user);


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows) {
        console.log(result.rows[0]);
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithId = getUserWithId;

// return Promise.resolve(users[id]);

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const newUser = [user.name, user.email, user.password];

  return pool
    .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, newUser)
    .then((result) => {
      if (result.rows) {
        console.log(result.rows[0]);
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.addUser = addUser;


// const userId = Object.keys(users).length + 1;
// user.id = userId;
// users[userId] = user;
// return Promise.resolve(user);


/// Reservations
/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  pool
    .query(
      `SELECT reservations.*, properties.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`
      , [guest_id, limit])
    .then((result) => {
      if (result.rows) {
        console.log(result.rows[0]);
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => {
      console.log(err.message);
    });
  // return getAllProperties(null, 2);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// const getAllProperties = function(options, limit = 10) {
//   const limitedProperties = {};
//   for (let i = 1; i <= limit; i++) {
//     limitedProperties[i] = properties[i];
//   }
//   return Promise.resolve(limitedProperties);
// }
// exports.getAllProperties = getAllProperties;
    
// refactoring
const getAllProperties = (options, limit = 10) => {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    queryString += `AND owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`%${options.minimum_price_per_night}%`);
    queryString += `AND cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`%${options.maximum_price_per_night}%`);
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  }

  if (options.minimum_rating) {
    queryParams.push(`%${options.minimum_rating}%`);
    queryString += `AND rating >= $${queryParams.length} `;
  }


  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool
    .query(queryString, queryParams)
    .then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;
    
    
/**
     * Add a property to the database
     * @param {{}} property An object containing all of the property details.
     * @return {Promise<{}>} A promise to the property.
     */
const addProperty = function(property) {
  const queryParams = [];
  const queryString = "";
  let values = "";

  // iterating inside the lists of object
  for (let x in property) {
    // console.log (x);
    queryString += x + ', ';
    queryParams.push(property[x]);
  }

  // iterating inside the lists of array after push
  for (let i = 1; i <= queryParams.length; i++) {
    values += '$' + i + ', ';
  }

  console.log(queryParams);
  console.log(queryString.substring(0, queryString.length - 2));
  console.log(values.substring(0, values.length - 2));

  return pool
    .query(`
      INSERT INTO properties (queryString.substring(0, queryString.length -2)) 
      VALUES (values.substring(0, values.length -2))
      RETURNING *;
      `, queryParams)
    .then((result) => {
      if (result.rows) {
        console.log(result.rows[0]);
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;
      
      

// const propertyId = Object.keys(properties).length + 1;
// property.id = propertyId;
// properties[propertyId] = property;
// return Promise.resolve(property);
    
    
    