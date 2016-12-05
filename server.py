#Import and load dotenv folder for python to easily set environment variables
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from flask import Flask, request, jsonify
import pg, os, bcrypt, uuid

import googlemaps
from datetime import datetime

db = pg.DB(
    dbname=os.environ.get('PG_DBNAME'),
    host=os.environ.get('PG_HOST'),
    user=os.environ.get('PG_USERNAME'),
    passwd=os.environ.get('PG_PASSWORD'),
)

# Google API key
api_key = os.environ.get('GOOGLE_API_KEY')
gmaps = googlemaps.Client(key=api_key)

db.debug = True

tmp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app = Flask('team_dom_ready', static_url_path='', template_folder=tmp_dir,
   static_folder=static_folder)

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/api/signup", methods=["POST"])
def api_signup():
    customer_info = request.get_json()

    username = request.get_json()['username']
    email = request.get_json()['email']
    password = request.get_json()['password']
    first_name = request.get_json()['first_name']
    last_name = request.get_json()['last_name']

    # encrypt a password
    # first step, generates a new salt
    salt = bcrypt.gensalt()
    # second step, generate the encrypted password
    encrypted_password = bcrypt.hashpw(password.encode('utf-8'), salt)

    signup_customer = db.insert(
        'customer',
        {
            'username': username,
            'email': email,
            'password': encrypted_password,
            'first_name': first_name,
            'last_name': last_name
        }
    )
    return jsonify(signup_customer)

@app.route("/api/login", methods = ["POST"])
def login():
    # Get data from a login form on front-end (in JSON format)
    custEntry = request.get_json()
    # Queries the customer database for an entry that matches the customer's username
    customer = db.query('select * from customer where username = $1', custEntry["username"]).dictresult()[0]
    # Grabs the existing encrytped password for the matching user entry
    encrypted_password = customer['password']
    # Grabs the password entered by the user on the login form
    entered_password = custEntry['password']
    # Encrypts the password entered by the user
    rehash = bcrypt.hashpw(entered_password.encode('utf-8'), encrypted_password)
    # Checks to see if the existing stored encrypted password matches encrypted version of the one entered by the user at login
    if rehash == encrypted_password:
        #If passwords match:
        # Create auth token
        token = uuid.uuid4()
        # Store created auth token in database
        db.insert('auth_token', token=token, customer_id=customer['id'])
        # Creates object of user information and the new auth token to return
        loggedin = {"user": {'id': customer['id'], 'username': customer['username'], 'email': customer['email'], 'first_name': customer['first_name'], 'last_name': customer['last_name']}, 'auth_token': token}
        #Retuns user info and auth token in JSON format
        return jsonify(loggedin)
    else:
        # If passwords don't match
        return 'login failed', 401

@app.route("/api/profile")
def profile_page():
    profile_information = {}
    profile_token = request.args.get('profile_token')

    if profile_token:
        customer_id = db.query(
        """
            SELECT
            	customer_id
            from
            	auth_token
            where
            	token = $1
        """, profile_token).dictresult()[0]

        customer_id = customer_id["customer_id"]
        customer_profile = db.query(
        """
            SELECT
                *
            from
                customer
            where
                id = $1
        """, customer_id
        ).dictresult()[0]

        del customer_profile["password"]

        reviews = db.query(
        """
            SELECT
                location.id,
                location.name,
                location.google_places_id,
                review.rating,
                customer.id
            from
                location
            inner join
                review
            on
                review.location_id = location.id
            inner join
                customer
            on
                customer.id = review.customer_id
            and
            customer.id = $1;
        """, customer_id).dictresult()

        wishlist = db.query(
        """
            SELECT
            	*
            from
            	customer,
            	wishlist_loc,
            	location
            where
            	customer.id = wishlist_loc.customer_id and
            	wishlist_loc.location_id = location.id and
            	customer.id =  $1;
        """, customer_id).dictresult()

        profile_information["customer"] = customer_profile
        profile_information["reviews"] = reviews
        profile_information["wishlist"] = wishlist

        print "\n\nProfile information is: %s\n\n" % profile_information

        return jsonify(profile_information)



@app.route("/api/search")
def api_search():

    profile_token = request.args.get('profile_token')
    customer_id = db.query('''
        SELECT
            customer_id
        from
            auth_token
        where
            token = $1
    ''', profile_token).namedresult()

    reviewed_markers = [];
    show_or_search = request.args.get('show_or_search')

    if customer_id == []:
        pass
    else:
        # grab the value of customer id
        customer_id = customer_id[0]

        # Determines if we want to show markers based on information in the database (show_or_search == "Show") or if we want to show one marker based on the address / business searched (show_or_search == "Search")
        if show_or_search == "Show":
            reviewed_markers = db.query(
            """
                SELECT
            		name,
                	latitude,
                	longitude,
                	google_places_id
                FROM
                	location,
                	review
                WHERE
                	review.location_id = location.id AND
                	review.customer_id = $1;
            """, customer_id).dictresult()

            wishlist_markers = db.query(
            """
                SELECT
                    name,
                	customer_id,
                	location_id,
                    latitude,
                    longitude,
                	google_places_id
                FROM
                	wishlist_loc,
                	location
                WHERE
                	wishlist_loc.location_id = location.id AND
                	wishlist_loc.customer_id = $1;
            """, customer_id).dictresult()

            markers = {
                'reviews': reviewed_markers,
                'wishlist': wishlist_markers
            }
            print 'Markers: %r', markers
            return jsonify(markers)

    if show_or_search == "Search":
        search = request.args.get('user_query')
        search = str(search)
        # Getting details from search
        search_result = gmaps.places(search)
        return jsonify(search_result)
    return 'Hello'

@app.route('/api/location/<place_id>')
def location(place_id):
    place_id = str(place_id)
    user_id = request.args.get('user_id')
    # Geocoding a place id
    geocode_result = gmaps.place(place_id)

    if user_id != None:
        # make a query to see if user has already wishlisted the location or not
        query = db.query(
            '''
            SELECT
        	    location_id
            FROM
            	customer
            INNER JOIN
                wishlist_loc
                ON wishlist_loc.customer_id = customer.id
            INNER JOIN
            	location
                ON wishlist_loc.location_id=location.id
            WHERE
            	customer.id = $1 AND
                location.google_places_id = $2;
            ''', user_id, place_id).dictresult()

        if query == []:
            is_wishlisted = False
        else:
            is_wishlisted = True

        # use google_places_id to make a query to grab location id
        location_id = db.query('select id from location where google_places_id = $1', place_id).dictresult()

        # check if location exists
        if location_id == []:
            review_info = None
        else:
            # first, grab the location_id and convert into integer
            location_id = location_id[0]['id']
            location_id = int(location_id)

            # make a query to grab the review for that location
            review_id = db.query(
            '''
            SELECT
                review.id
            FROM
                customer
            INNER JOIN
                review
                ON review.customer_id = customer.id
            INNER JOIN
                location
                ON review.location_id=location.id
            WHERE
                customer.id = $1
                    AND
                        location.id = $2
            ''', user_id, location_id).dictresult()

            # if review does exist
            if review_id != []:

                # grab the review id and convert into integer
                review_id = review_id[0]['id']
                review_id = int(review_id)

                # make a query to grab the review info
                review_info = db.query(
                '''
                SELECT
                    review.title,
                    review.review,
                    review.rating
                FROM
                    review
                WHERE
                    review.id = $1
                ''', review_id).dictresult()[0]
            else:
                review_info = None

        return jsonify([
            {
            'geocode_result': geocode_result,
            'is_wishlisted': is_wishlisted,
            'review_info': review_info
            }
        ])
    else:
        return jsonify([
            {
            'geocode_result': geocode_result,
            'is_wishlisted': None,
            'review_info': None
            }
        ])

@app.route('/api/location/edit/review', methods=['POST'])
def location_edit():
    results = request.get_json();
    review_info = results['review_info']
    review = review_info['review']
    review_title = review_info['title']
    review_rating = review_info['rating']
    place_id = results['location_info']['google_places_id']
    name = results['location_info']['name']
    description = results['location_info']['description']
    lat = results['location_info']['latitude']
    lng = results['location_info']['longitude']
    customer_id = int(results['user_info']['id'])

    # use google_places_id to make a query to grab location id
    location_id = db.query('select id from location where google_places_id = $1', place_id).dictresult()
    if location_id == []:
        # create a new location in the db
        db.insert(
            'location',
            {
                'name': name,
                'description': description,
                'google_places_id': place_id,
                'latitude': lat,
                'longitude': lng
            }
        )
    else:
        # first, grab the location_id and convert into integer
        location_id = location_id[0]['id']
        location_id = int(location_id)
        # make a query to check if review exists
        review_query = db.query(
        '''
        SELECT
    	    review.id
        FROM
        	customer
        INNER JOIN
            review
            ON review.customer_id = customer.id
        INNER JOIN
        	location
            ON review.location_id=location.id
        WHERE
            customer.id = $1
                AND
                    location.id = $2
        ''', customer_id, location_id).dictresult()
        if review_query == []:
            # create a new review
            db.insert(
                    'review', {
                        'title': review_title,
                        'review': review,
                        'rating': review_rating,
                        'customer_id': customer_id,
                        'location_id': location_id
                    }
                )
        else:
            review_id = review_query[0]['id']
            review_id = int(review_id)
            # update the review in the db
            db.update(
                'review', {
                    'id': review_id,
                    'title': review_title,
                    'review': review,
                    'rating': review_rating,
                    'customer_id': customer_id,
                    'location_id': location_id
                }
            )

    return jsonify(location_id)

@app.route("/api/location/edit/wishlisted", methods=['POST'])
def marked():
    results = request.get_json();
    marked = results['marked']
    place_id = results['location_info']['google_places_id']
    name = results['location_info']['name']
    description = results['location_info']['description']
    lat = results['location_info']['latitude']
    lng = results['location_info']['longitude']
    user_id = results['user_info']['id']
    # make a query to grab the location id
    location_id = db.query('select id from location where google_places_id = $1', place_id).dictresult()
    if location_id == []:
        # create a new location in the db
                db.insert(
                    'location',
                    {
                        'name': name,
                        'description': description,
                        'google_places_id': place_id,
                        'latitude': lat,
                        'longitude': lng
                    }

                )
    # if the location already exists in the database
    else:
        pass

    # make a query to grab the location id
    location_id = db.query('select id from location where google_places_id = $1', place_id).dictresult()
    location_id = location_id[0]['id']
    location_id = int(location_id)

    # if the location is wishlisted
    if marked:
        # add location to the wishlist
        db.insert(
                    'wishlist_loc',
                    {
                        'customer_id': user_id,
                        'location_id': location_id
                    }
                )
    else:
        # remove the location from the wishlist
        db.query('delete from wishlist_loc where wishlist_loc.location_id = $1', location_id)


if __name__ == "__main__":
    app.run(debug=True)
