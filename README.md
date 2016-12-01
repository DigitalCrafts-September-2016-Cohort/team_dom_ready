# Team Dom Ready project
img goes here

######
[Live Project]()  |  [Overview](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready)   |   [Team](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready--roles)   |   [What We Used](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready#what-we-used)   |   [MVP](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready#mvp-minimum-viable-product)   |   [Challenges](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready#challenges--solutions)   |   [Code](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready#code-snippets)   | [Screenshots](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready#screenshots)   |   [Contributing](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready#contribute-to-nerd-review)

##Overview:


**Our conceptual goals for the site:**
*
*
*
*
*

##Github Link:
[Team DOM Ready](https://github.com/DigitalCrafts-September-2016-Cohort/team_dom_ready.git)

##Team Members & Roles:
**Click on each member's name to see their GitHub profile**
All team members are students in the [Digital Crafts](https://digitalcrafts.com) September 2016 cohort. This project was initially completed as the first full-stack project for that curriculum and utilized the SCRUM development process and philosophy.  Paired and mob programming were the focus in the initial and final stages, while mid- and late-stage work was primarily completed through individual but coordinated and co-located programming.

####Team DOM Ready
* [John Coppola](https://github.com/johnnycopes/)  
**Primary team role:** <br />
**Contributions:**  <br />
**Key code portions:**

* [Juan Cortes](https://github.com/jcortes0309)  
**Primary team role:** <br />
**Contributions:**  <br />
**Key code portions:**

* [Carolyn Lam](https://github.com/Pumala)  
**Primary team role:** <br />
**Contributions:**  <br />
**Key code portions:**

* [Dominic Zenon](https://github.com/Daz4ever)  
**Primary team role:** <br />
**Contributions:**  <br />
**Key code portions:**

##What we used:
**Languages:**  
* Python (including the following modules)
  * PyGreSQL
  * datetime
  * os
  * dotenv
* HTML5
* CSS
* JavaScript/jQuery

**Frameworks:**  
* AngularJS 1.5.8
* Bootstrap
  * [Validator - plugin](https://1000hz.github.io/bootstrap-validator/)

**Other:**  
* PostgreSQL
* Amazon Web Services EC2
* Apache
* Icons from the Noun project
  * *NERD made by Nicolas Vicent -- http://www.nicolas-vicent.com/*
  * *CROWN made by Nikita Kozin -- ya.kozinnikita@ya.ruÂ*


##MVP (Minimum Viable Product):
This was the first full-stack project for all team members, therefore our first experience at deciding on an MVP.  One challenge we faced was a blurring the line between our MVP and stretch goals due to a desire to make efficient use of our time, dispatching some members to advanced tasks if troubleshooting an MVP issue was a one person job.

**Initial MVP**
*
*
*
*
*
*

We started incorporating stretch goals about three days before the project deadline (as soon as we knew that we would be able to reach MVP ahead of the deadline), but before our MVP was officially deployed.

**Stretch Goals**
*
*
*
*
*
*

## Challenges & Solutions:
**Some of the biggest challenges we faced with this project build included:**

1.  **Challenge:** Sorting grid pages without implementing a significant amount of JavaScript. Needed to display a list of aliased sort options that would reload the page automatically on selection.  

    **Solution:** We hard coded the sort options for each page.  While this is not ideal, the sort options were customized for each page and this allowed us to more clearly follow the path through the HTML to the back-end.  There is a simple ```onchange="this.form.submit()"``` attribute for the form which contains the ```<select>``` tag, so every time the drop-down select menu is used to select a different sort order, a value gets passed to the route handler noting the order.  We run a conditional check on the sort order value and generate two variables corresponding to the relevant SQL 'order by' syntax for that sort order.  The HTML and Jinja for loop to display the tile grid is generalized, but the query generating the loop is then sorted.

2.  **Challenge:** So. Many. Tables.  We created a fairly robust database structure, in that we attempted to follow normal forms and keep things atomic.  However, this mean that some of our queries needed to jump through 6 different tables, creating some very long SQL statements.

    **Solution:** We some redundancies for the very advance app routes by using one query to generate one list to be fed to the HTML as an iterator at a time.  This did save a lot of time when trying to debug our queries however, as we were able to further isolate errors and find them quicker.  It also turned out to save some time later on as we were able to reuse the simpler queries as building blocks for other route handlers.

3.  **Challenge:** Create visual hover effects that were more unique and eye-catching than the standard text underline, but not overwhelming or distracting.

    **Solution:** We thought it would be cool to implement CSS pseudo-elements because a) they're extremely versatile and b) they don't clutter up the HTML files. The lines that appear below the central line of text in the tiles and under the logo name were fairly easy to implement after a bit of research; it just involved using the ```visibility``` and ```scaleX``` properties so that they would appear to come out of nowhere. The little arrows in the nav menu links were a bit more complex: originally, we had them positioned far off-screen but found that because they had to move so far in such a short transition time that we weren't getting the desired visual 'slide in' effect. A combination of the aforementioned visibility trick (making them appear out of nowhere) and positioning them more closely to their respective links resulted in a much smoother visual effect.

4. **Challenge:** Having the 'new review' form show the user the correct available categories based on what they selected from the previous category. Also, being able to write in an entirely new category in the form.


##Code Snippets

Example 1:
```
```

Example 2:
```
```

Example 3:
```
```

##Screenshots
![Homepage]()
![Cat_SubCat]()
![Individual Product]()
![Tablet]()
![Mobile]()

********

#Contribute to Nerd Review

##Desired Contributions:
While what we *really* would like to see are your passionate rants about the features of big fluffy coats, there are some features we haven't implemented yet in Nerd Review that we think are important:
* User upload of product images
* Advanced text-editor for new reviews
* Community evaluation of a review through a voting system
* Assigning a reputation to a reviewer based on the scores of their posted reviews
* Nerd-tastic improvements to our UI

##Contributing
1. Fork it
2. Create a new feature branch (named after your intended feature): `git checkout -b new-feature-name`
3. Commit your changes: `git commit -am 'Added the feature!'`
4. Push to your feature branch: `git push origin new-feature-name`
5. Submit a pull request!

##Project History
12/02/2016 - Project Completion and Deployment  
11/28/2016 - Project Start
