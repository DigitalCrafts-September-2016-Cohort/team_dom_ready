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
# Initialize the Flask application
app = Flask("DOM Ready App", static_url_path='', template_folder = tmp_dir)

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


@app.route("/api/search")
def api_search():
    # 11055 Perimeter Trace East, Atlanta GA 30346

    address = request.args.get('user_query')
    address = str(address)
    print '\n\naddress variable %s\n\n' % address
    print type(address)
    # Geocoding an address
    geocode_result = gmaps.geocode(address)
    print "\n\n\nThis is the geocode data: %s\n\n\n" % geocode_result
    return jsonify(geocode_result)



if __name__ == "__main__":
    app.run(debug=True)
