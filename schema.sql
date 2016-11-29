CREATE TABLE customer (
  id serial PRIMARY KEY,
  username text,
  email text,
  password text,
  first_name text,
  last_name text,
  avatar bytea
);

CREATE TABLE location (
  id serial PRIMARY KEY,
  name text,
  lat_long point,
  description text
);

CREATE TABLE review (
  id serial PRIMARY KEY,
  title text,
  review text,
  rating integer,
  customer_id integer REFERENCES customer (id),
  location_id integer REFERENCES location (id)
);

CREATE TABLE category (
  id serial PRIMARY KEY,
  category text
);

CREATE TABLE loc_category (
  location_id integer REFERENCES location (id),
  category_id integer REFERENCES category (id)

);

CREATE TABLE auth_token (
  token text,
  token_expires timestamp without time zone,
  customer_id integer REFERENCES customer (id)
);

CREATE TABLE wishlist_loc (
  comment text,
  customer_id integer REFERENCES customer (id),
  location_id integer REFERENCES location (id)
);





-- sample queries

select
	*
from
	review
inner join
 	location on
 	review.location_id = location.id
inner join
	loc_category on
	loc_category.location_id = location.id
inner join
	category on
	loc_category.category_id = category.id;
