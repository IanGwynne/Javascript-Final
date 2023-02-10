const express = require('express');
const app = express();
const queries = require("./mysql/queries");

app.set('view engine', 'ejs');
app.listen(3000);
//Ian Haworth
//Base home page
app.get('/', function(request, response) {
  queries.getState().then(result => {
    let statesFromSQL = result;
    queries.getCities().then(result => {
      response.render('index', { title: 'Airbnb Search App', state: statesFromSQL, city: result});
  })});
});

app.get('/airbnb', (request, response) => {
  response.render('airbnb', { title:'AirBnb' });
});

//Route for finding one compatiple airbnb
app.get('/airbnb/find-one', (request, response) => {
  
  if(request.query.amenities)
  {

    queries.findListing(
      { 
        number_rooms: request.query.bedrooms,
        guest:request.query.guests,
        amenities: request.query.amenities,
        price:request.query.night 
      }).then(result => {
        if(result.length > 0)
        {
          queries.getAmenities({amenities:result[0].id}).then(amenitiesResult => {
            response.render("listing", { listing: result[0], amenities:amenitiesResult });
          })

        }
        else
        response.render('failed');
      });
    }
  else
  {
    queries.findListingNoAmenities(
      { 
        number_rooms: request.query.bedrooms,
        guest:request.query.guests,
        price:request.query.night 
      }).then(result => {
        if(result.length > 0)
        {
        queries.getAmenities({amenities:result[0].id}).then(amenitiesResult => {
          response.render("listing", { listing: result[0], amenities:amenitiesResult });
        })
        }
        else
        response.render('failed');
      });
  }
});

// Route for finding many different listings matching criteria
app.get ("/airbnb/find-many", async (request, response) => {
  queries.findListings(
    { 
      number_rooms: request.query.bedrooms,
      state: request.query.state,
      city: request.query.city
    }).then(result => {
      if(result.length > 0)
      {
        response.render("listings", { listings: result });
      }
      else
      response.render('failed');
    });
});

// route for finding a single listing from the list of multiple
app.get('/picked', (request, response) => {
  queries.getOneFromMany(
    { 
      id: request.query.id
    }).then(result => {
      if(result.length > 0)
              {
        queries.getAmenities({amenities:result[0].id}).then(amenitiesResult => {
          response.render("listing", { listing: result[0], amenities:amenitiesResult });
        })
        }
      else
        response.render('failed');
    });
});

