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
    print "Customer information: %s" % customer_info

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
    print "Customer signup information: %s" % signup_customer
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
        loggedin = {"user": {'username': customer['username'], 'email': customer['email'], 'first_name': customer['first_name'], 'last_name': customer['last_name']}, 'authtoken': token}
        #Retuns user info and auth token in JSON format
        return jsonify(loggedin)
    else:
        # If passwords don't match
        return 'login failed', 401

@app.route("/api/search")
def api_search():
    # Hard coded the customer_id for now.  We'll get the current user's customer_id from the database later using a token that is created at the time of login
    customer_id = 1;
    markers = [];
    show_or_search = request.args.get('show_or_search')

    # Determines if we want to show markers based on information in the database (show_or_search == "Show") or if we want to show one marker based on the address / business searched (show_or_search == "Search")
    if show_or_search == "Show":
        # print "This is the show or search info: %s" % show_or_search

        markers = db.query(
        """
            SELECT
        		name,
            	latitude,
            	longitude,
            	google_places_id
            FROM
            	location,
            	review,
            	customer
            WHERE
            	review.location_id = location.id AND
            	review.customer_id = customer.id AND
            	customer.id = $1;
        """, customer_id).dictresult()
        return jsonify(markers)
    elif show_or_search == "Search":
        address = request.args.get('user_query')
        address = str(address)
        # Geocoding an address
        geocode_result = gmaps.geocode(address)
        return jsonify(geocode_result)


@app.route('/api/location/<place_id>')
def location(place_id):
    # place_id = request.args.get('place_id')
    place_id = str(place_id)
    # Geocoding a place id
    geocode_result = gmaps.place(place_id)
    return jsonify(geocode_result)

@app.route('/api/location/edit', methods=['POST'])
def location_edit():

    data = request.get_json()
    # grab customer id
    customer_id = 2
    location_id = 1

    # grab the user data being sent here

    # check if placeid exist in database

    query = db.query(
    '''
    SELECT
	    *
    FROM
    	customer
    INNER JOIN
        review
        ON review.customer_id = customer.id
    INNER JOIN
    	location
        ON review.location_id=location.id
    INNER JOIN
    	wishlist_loc
    	ON location.id = wishlist_loc.location_id WHERE
            	customer.id = $1
            AND
                location.id = $2
    ''', customer_id, location_id).dictresult()


    print query
    # check if there is a review
    if query == []:
        review_exists = False
    else:
        review_exists = True

    print "is saved %s" % is_saved

    # if user has chosen to review the location when it hasn't been reviewed already
    if not review_exists:

        db.insert(
            'review', {
                'title': data.title,
                'review': data.review,
                'rating': data.rating,
                'customer_id': data.customer_id,
                'location_id': data.location_id
            }
        )
        # then we want to make a link between location and user

        # prod_id = db.query('select * from location where id = $1', productId).dictresult()
    #  if user decided to update the review that was linked to the user originally
    elif review_exists:
        # update the user's review on the location
        db.update(
            'review', {
                'title': data.title,
                'review': data.review,
                'rating': data.rating
            }
        )

    return jsonify(location_id)

@app.route("/api/profile", methods = ["POST"])
def user_profile():

    # the customer id
    customer_id = result.get_json()['customer_id']
    return "Hello"



if __name__ == "__main__":
    app.run(debug=True)
