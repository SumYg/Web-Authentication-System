# A Simple Web Authentication System
This system uses `MariaDB`, `Node.js` and `React` to implement an authentication system.
## Usage
### Set Up `MariaDB`
Create two databases called **users** and **documents** and then use the SQL commands in the corresponding .txt files to create the tables.
### Run `Node.js` and `React`
#### Node.js
First, create a directory and open a console in the directory, then initialize a new `Node.JS` app by:
```ssh
npm init
```
Put **email.js** and **index.js** in this repo into the directory and install the packages:
```ssh
npm i express mariadb express-session dotenv bcrypt
```
After that, create a file named **.env** to put some hidden value (Curly brackets and the string inside are to be replaced):
```
SECRET="{A secret string for express-session}"
EMAILADDRESS="{The gmail address used by this app}"
EMAILPASS="{The password of the email}"
DB_USER="{Username in MariaDB}"
DB_PASS="{Password}"
DB_PORT="{Port of MariaDB (Even if the port is by default 3306, you need to enter 3306 here)}"
```
You need to enable IMAP in order to allow `Node.js` to send an email.

Start the `Node.js` server by:
```ssh
node index.js
```
`Node.js` is now running on Port 8000.
#### React
You can first use *create-react-app* to create a new `React` app.
```ssh
npx create-react-app {name of the app}
```
Then put **App.js** and **Document.js** into the **/src** directory and install the package:
```ssh
npm i react-router-dom
```
Run the app in the app's root directory:
```ssh
npm start
```
`React` is now running on Port 3000.

## Characteristics of this System
### Use of Session and Cookies
Since when starting a new tab or browser window, a new `React` instance is created and the states of different instances are independent. Session and cookies are used in order to allow the sharing of data among different windows and tabs.
### Communication between the Client and Server
In this app, only FetchAPI is used for the `React` app to send and receive a message from the server because it is easy to use. Since for each fetch, the server needs to retrieve the data stored for the session, `credentials: "include"` is set for all fetch.

### Authentication
In the `React` client side, the state variable `pageState` is initialized to null in the constructor since we can't know whether the user is already authenticated or not at the time when the `React` components mount. Therefore, after all the components are mounted, which means in the function `componentDidMount()`, `checkLoginStatus()` is called and it will fetch the server with the path `/check` to ask the server to check whether the session variable `loggedIn` has already set to be true. (If the variable is null, it means that the session is newly created, else if the variable is false, the user had logged out before). The response from the server in this path is in JSON format. The value of the key `loginStatus` is true when the user has logged in which means the session variable `loggedIn` is set to true, and the user's id and username are also stored in the JSON.

When the `React` app receives the message that the user had already logged in, its state variables `pageState`, `id` and `username` would be set to 'logout', the user's id in the database and the user's name registered in the database. Otherwise, the user hasn't logged in and the `pageState` is set to be 'login'.

##### `pageState`
###### logout
In this state, `React` generates a logged in home page. The heading shows user's name and id. Also there is a logout button, when the user clicks the button, the session in the server is destroyed, and the state is change to 'login'.

###### login
When the state variable `pageState` is set to 'login', the page is a login form with a greeting to ask the user to log in. On this page, there is also a register button that will change the `pageState` to 'register'.

###### register
In this state, the page will render a registration form with a headline, a submit button and a button to go back to the login page, which is to change the state to 'login'.

#### Registration
After the user completes the form and submits it, the form data would be fetched to the server using the POST method. The server will start a connection to the `MariaDB` and search for an account with the account name input by the user in the submitted form. If the account had already been registered, return a string 'Duplicate account', otherwise check the email for duplication with the same method, only when there is no duplication of both the account and the email, the server app would insert a new row to the table **users** and return a status 201. The client app waits and checks for the response status, if the status is 201, alert the registration is successfully, otherwise alert duplicate account or email.

#### Password and Login Checking
This app uses the `bcrypt` library for password hashing and checking.
##### Password hashing when registering a new account
After checking for duplicates in the server during registration, the app will hash the password first, then store the resulting hash as the password. The constant variable `secureParameter` defines saltRounds in `bcrypt`.
##### Login checking
The function `compare` in the `bcrypt` library is used for checking if the password inputted by the user is correct.
### Routing
Besides the home page which is in the path `/`, there is also a document page in the path `/document/xxxxxx` for showing some specialized contents. The state of this page is 'logout', so there is a logout button. Besides, there is also 'Send Me Email' and 'Back to Home' button.
#### `/document`
If the user navigates to this page, the heading will change to 'No document id in the url' since different documents are supposed to have some ids or hashes to index.

#### `/document/xx/xx`
If the path contains more than 1 slash, 'Invalid URL' is shown since the indexes of documents are supposed not to contain any slashes.

#### `/document/xxx`
This is the correct format of the URL to show the document. In this app, the database **documents** only contain the document's id and the corresponding hash. The page only shows the real id stored in the table **docs** of the given hash. If the hash cannot be found in the table, the pages shows 'not found'.

#### Send Me Email
There is a button on the document page to ask the server to send an email to the user's registered email. The content of the email is hardcoded.

#### Back to Home
This button allows users to go back to the home page after going to the document page.
