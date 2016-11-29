#Import and load dotenv folder for python to easily set environment variables
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from flask import Flask, request, jsonify
import pg, os, bcrypt, uuid

db = pg.DB(
    dbname=os.environ.get('PG_DBNAME'),
    host=os.environ.get('PG_HOST'),
    user=os.environ.get('PG_USERNAME'),
    passwd=os.environ.get('PG_PASSWORD')
)

db.debug = True

tmp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
# Initialize the Flask application
app = Flask("DOM Ready App", static_url_path='', template_folder = tmp_dir)

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/api/signup", methods=["POST"])
def api_signup():
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

    result = db.insert(
        'customer',
        {
            'username': username,
            'email': email,
            'password': encrypted_password,
            'first_name': first_name,
            'last_name': last_name
        }
    )
    return jsonify(result)





if __name__ == "__main__":
    app.run(debug=True)
