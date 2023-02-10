const mysql = require("./config.js");
//Ian Haworth
//SQL queries

// queries a place and limits by amenities and number rooms
// it returns all fields from the "place" table, as well as the city name, state name, and the owner's first/last name and email
// returns a promise -- so you must use .then() to access its data
// example is server.js line 21-23
function findListing(criteria) {
    let query = `SELECT A.*, B.name as cityName, C.name as stateName, D.first_name, D.last_name, D.email
        FROM places A
        JOIN cities B on A.city_id = B.id
        JOIN states C on C.id = B.state_id
        JOIN users D ON A.user_id = D.id
        WHERE A.id IN (
        SELECT place_id FROM place_amenity 
        WHERE amenity_id 
        IN(?)
        GROUP BY place_id
        HAVING count(place_id) >= ?
    )
    AND A.price_by_night <= ? 
    AND A.max_guest >= ?
    AND A.number_rooms >= ? LIMIT 1`;

    let safeQuery = mysql.functions.format(query, [criteria.amenities, criteria.amenities.length, criteria.price, criteria.guest, criteria.number_rooms]);
    
    return querySql(safeQuery);
}

//finds listing if no amenities are passed
function findListingNoAmenities(criteria)
{
    let query = `SELECT A.*, B.name as cityName, C.name as stateName, D.first_name, D.last_name, D.email
    FROM places A
    JOIN cities B on A.city_id = B.id
    JOIN states C on C.id = B.state_id
    JOIN users D ON A.user_id = D.id
    WHERE A.price_by_night <= ? 
    AND A.max_guest >= ?
    AND A.number_rooms >= ? LIMIT 1`;

let safeQuery = mysql.functions.format(query, [criteria.price, criteria.guest, criteria.number_rooms]);

return querySql(safeQuery);
}
// queries a list of places and limits by the number of rooms
// only returns 1 result -- that is a promise -- so you must use .then() to access its data
function findListings(criteria) {
    let selectQuery = `SELECT A.*, B.name as cityName, C.name as stateName FROM places A
        JOIN cities B ON A.city_id = B.id
        JOIN states C on B.state_id = C.id
        WHERE number_rooms >= ?
        AND C.id = ?
        AND B.id = ?`;
    let safeQuery = mysql.functions.format(selectQuery, [criteria.number_rooms, criteria.state, criteria.city]);
    return querySql(safeQuery);
}

//gets list of states
function getState() {
    let selectQuery = `SELECT * FROM states ORDER BY name`;
    return querySql(selectQuery);
}

//gets list of cities
function getCities() {
    let selectQuery = `SELECT * FROM cities ORDER BY name`;
    return querySql(selectQuery);
}

// function to find one listing from many
function getOneFromMany(criteria)
{
    let selectQuery = `SELECT A.*, B.name as cityName, C.name as stateName, D.first_name, D.last_name, D.email
    FROM places A
    JOIN cities B on A.city_id = B.id
    JOIN states C on C.id = B.state_id
    JOIN users D ON A.user_id = D.id
    WHERE A.id = ?`;
    let safeQuery = mysql.functions.format(selectQuery,[criteria.id])

    return querySql(safeQuery);
}

// Gets a list of amenities at the current location
function getAmenities(criteria)
{
    let selectQuery = `SELECT A.* FROM amenities A
    JOIN place_amenity B on A.id=B.amenity_id
    JOIN places C ON C.id = B.place_id
    WHERE C.id = ?`;
    let safeQuery = mysql.functions.format(selectQuery,[criteria.amenities])
    return querySql(safeQuery);
}

module.exports = {
    "findListing": findListing,
    "findListings": findListings,
    "getState": getState,
    "getCities": getCities,
    "getOneFromMany": getOneFromMany,
    "findListingNoAmenities": findListingNoAmenities,
    "getAmenities": getAmenities
};


/*****************************************************************
 *        You can ignore everything below here!
 *****************************************************************/

// don't worry too much about this function! 
// it has been written to return the data from your database query
// *** it DOES NOT need modifying! ***
function querySql(sql) {
    let con = mysql.getCon();

    con.connect(function(error) {
        if (error) {
          return console.error(error);
        } 
      });

    return new Promise((resolve, reject) => {
        con.query(sql, (error, sqlResult) => {
            if(error) {
                return reject(error);
            }           

            return resolve(sqlResult);
        });

        con.end();
    });
}