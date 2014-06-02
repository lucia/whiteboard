Dependencies for the project to run:

1. Installing and running Node.js locally: 
http://nodejs.org/

2. Install NPM (Node Package Manager) - will be used to install needed libraries and frameworks: 
https://npmjs.org/

3. Install Express Framework, the popular MVC framework for Node.js: 
sudo npm install -g express

4. Install nodemon - used to run node.js automatically and restart the server on each change made
sudo npm install nodemon -g

5. Start the app
nodemon app.js

6. Install Socket.IO, the library for real-time communication in JavaScript
npm install socket.io express

7. We use Jade, the Node templating engine: 
http://jade-lang.com/

8. We use Paper.js, the popular framework for HTML 5 Canvas for drawing
http://paperjs.org/

9. Setup a Virtual host for QRcode project, included in this build

10. Edit app.js and set the qrcode and site URLs
app.locals.qrcodeUrl
app.locals.siteUrl
