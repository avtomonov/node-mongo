const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const auth = require("./auth");

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password do not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.send({ message: "You are authorized to access me" });
});

// users endpoint

app.get("/users", auth, (request, response) => {
  response.send({ message: "users" });
});

app.post("/users", (request, response) => {
  response.send({"results":[{"gender":"female","name":{"title":"Mrs","first":"Aada","last":"Kyllo"},"location":{"street":{"number":627,"name":"Korkeavuorenkatu"},"city":"Seinäjoki","state":"Päijät-Häme","country":"Finland","postcode":55344,"coordinates":{"latitude":"-27.8353","longitude":"140.6837"},"timezone":{"offset":"-6:00","description":"Central Time (US & Canada), Mexico City"}},"email":"aada.kyllo@example.com","login":{"uuid":"066315c9-81dd-43d0-abf4-31a6f3e70e73","username":"crazyduck176","password":"wrestlin","salt":"eYZm3b4S","md5":"09edc97688519c17dc6541c41bceed39","sha1":"0e8fc49fab85aa5fa14efe2e41b11d29d3d6d8f5","sha256":"28a96c7435145840882216c100c5c554a159976510b9b20cf50133a069af750e"},"dob":{"date":"1980-04-06T18:29:24.899Z","age":42},"registered":{"date":"2010-08-25T17:31:06.746Z","age":12},"phone":"03-940-842","cell":"041-009-50-18","id":{"name":"HETU","value":"NaNNA230undefined"},"picture":{"large":"https://randomuser.me/api/portraits/women/92.jpg","medium":"https://randomuser.me/api/portraits/med/women/92.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/92.jpg"},"nat":"FI"},{"gender":"female","name":{"title":"Miss","first":"Alexandra","last":"Thomas"},"location":{"street":{"number":6247,"name":"Otipua Road"},"city":"Palmerston North","state":"Canterbury","country":"New Zealand","postcode":92390,"coordinates":{"latitude":"-67.8195","longitude":"-178.5681"},"timezone":{"offset":"-3:00","description":"Brazil, Buenos Aires, Georgetown"}},"email":"alexandra.thomas@example.com","login":{"uuid":"0e902d35-2c90-4b45-9992-e081a45f3969","username":"happylion712","password":"milk","salt":"cIhMtv7p","md5":"58b12d4c6ea015575195d357bff3c352","sha1":"d1aa301664d682d73386bff994d5d1c8fb8d9e96","sha256":"d42a15c210eb29c0c3a0c1b29f89664df9eb8a2031abaff8f5fa1a45c94689a4"},"dob":{"date":"1957-03-23T10:56:40.949Z","age":65},"registered":{"date":"2011-04-09T17:37:28.717Z","age":11},"phone":"(150)-543-9419","cell":"(915)-230-2586","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/women/93.jpg","medium":"https://randomuser.me/api/portraits/med/women/93.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/93.jpg"},"nat":"NZ"},{"gender":"male","name":{"title":"Mr","first":"Emil","last":"Sørensen"},"location":{"street":{"number":4153,"name":"Strandgårdsvej"},"city":"Vipperød","state":"Sjælland","country":"Denmark","postcode":54496,"coordinates":{"latitude":"32.4856","longitude":"-100.2430"},"timezone":{"offset":"-6:00","description":"Central Time (US & Canada), Mexico City"}},"email":"emil.sorensen@example.com","login":{"uuid":"7f280875-e73e-4f29-b504-8da414e36cfb","username":"whitecat564","password":"clyde","salt":"mvdpauE3","md5":"9ecbc2b7175e95d64d8729ba0c8f3c98","sha1":"60a130e23ded9f9d962c2729846ca376e214f57c","sha256":"d97d5a35dab0a55522dc9574c764240caa6225e9011318b680b6561c2fcf083a"},"dob":{"date":"1953-12-03T22:45:10.632Z","age":69},"registered":{"date":"2006-11-17T21:40:51.570Z","age":16},"phone":"70832793","cell":"83440159","id":{"name":"CPR","value":"031253-6058"},"picture":{"large":"https://randomuser.me/api/portraits/men/49.jpg","medium":"https://randomuser.me/api/portraits/med/men/49.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/49.jpg"},"nat":"DK"},{"gender":"male","name":{"title":"Mr","first":"Volkan","last":"Poçan"},"location":{"street":{"number":6503,"name":"Talak Göktepe Cd"},"city":"Erzincan","state":"Bursa","country":"Turkey","postcode":68090,"coordinates":{"latitude":"-1.0063","longitude":"-109.1859"},"timezone":{"offset":"+9:30","description":"Adelaide, Darwin"}},"email":"volkan.pocan@example.com","login":{"uuid":"504057e3-e282-437b-9e54-cf5d566028e9","username":"silverladybug826","password":"bambi","salt":"s42J61a9","md5":"e52182926eabdd3f8a5825b4f586e862","sha1":"65a0c40dd61df7cd4dbce7b5d7c630f70c07f11a","sha256":"dd6a76fd9ea5bbee6d160d04bec2e34e6178f9b8cfd45334ad97eff6e3188157"},"dob":{"date":"1996-08-21T01:48:04.007Z","age":26},"registered":{"date":"2016-07-24T07:11:22.397Z","age":6},"phone":"(565)-228-2388","cell":"(539)-227-7780","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/men/74.jpg","medium":"https://randomuser.me/api/portraits/med/men/74.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/74.jpg"},"nat":"TR"},{"gender":"male","name":{"title":"Mr","first":"Lawrence","last":"Herrera"},"location":{"street":{"number":667,"name":"E Pecan St"},"city":"Geraldton","state":"South Australia","country":"Australia","postcode":8346,"coordinates":{"latitude":"-89.8124","longitude":"34.8766"},"timezone":{"offset":"+3:30","description":"Tehran"}},"email":"lawrence.herrera@example.com","login":{"uuid":"de1fbea4-43a4-4ed9-ad0f-1c7cebb99834","username":"brownkoala796","password":"753951","salt":"u6EsIVzm","md5":"d855fd045ace1a5daeaa698b1c605957","sha1":"ad85060b54db6d819a6084bd738ed7e37c2dfed7","sha256":"6a8e9038e0174715ca226631eebc3d458e7d2fe5392d262528150c9120b99c38"},"dob":{"date":"1947-10-23T07:45:17.609Z","age":75},"registered":{"date":"2022-01-17T13:34:02.169Z","age":1},"phone":"04-2438-4137","cell":"0447-997-390","id":{"name":"TFN","value":"064709699"},"picture":{"large":"https://randomuser.me/api/portraits/men/44.jpg","medium":"https://randomuser.me/api/portraits/med/men/44.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/44.jpg"},"nat":"AU"},{"gender":"male","name":{"title":"Mr","first":"Michael","last":"Garcia"},"location":{"street":{"number":7936,"name":"Pecan Acres Ln"},"city":"Darwin","state":"South Australia","country":"Australia","postcode":7071,"coordinates":{"latitude":"61.6469","longitude":"-75.6025"},"timezone":{"offset":"+10:00","description":"Eastern Australia, Guam, Vladivostok"}},"email":"michael.garcia@example.com","login":{"uuid":"6ee84f43-ccbe-4100-9691-368b5e748c63","username":"bigfrog214","password":"1996","salt":"VQaAx14C","md5":"358b5d0eacbc5da50a9718548800e369","sha1":"e37515ba4add08a0a2303735099ed644983cc978","sha256":"6f415804b8eb534bd81f4541b55c77e61ecd3e49b4efd24badc8ef55bad8c875"},"dob":{"date":"1992-10-10T10:58:38.612Z","age":30},"registered":{"date":"2012-12-23T12:15:48.799Z","age":10},"phone":"00-1551-4652","cell":"0403-942-672","id":{"name":"TFN","value":"649181326"},"picture":{"large":"https://randomuser.me/api/portraits/men/65.jpg","medium":"https://randomuser.me/api/portraits/med/men/65.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/65.jpg"},"nat":"AU"},{"gender":"female","name":{"title":"Miss","first":"Marcela","last":"Rivas"},"location":{"street":{"number":437,"name":"Privada Ucrania"},"city":"Villa Lázaro Cárdenas","state":"Hidalgo","country":"Mexico","postcode":85234,"coordinates":{"latitude":"-79.9477","longitude":"-91.1593"},"timezone":{"offset":"+5:45","description":"Kathmandu"}},"email":"marcela.rivas@example.com","login":{"uuid":"7c0f7737-5d72-45b7-beeb-6f01a7b0eaee","username":"goldenlion897","password":"vanhalen","salt":"YxfmvhiA","md5":"6a73c4905c5c127f52cc64eaa2329502","sha1":"1b1acaa47eaa8f831cdd15dda5ccd46d69e75d40","sha256":"4365741ae0957e07fdc7a62ee65c971f9162a6f3b6a2610cadffb5aa56a3e8e6"},"dob":{"date":"1981-11-16T04:27:18.703Z","age":41},"registered":{"date":"2016-05-22T02:24:50.408Z","age":6},"phone":"(689) 020 3203","cell":"(671) 795 0308","id":{"name":"NSS","value":"08 33 76 4365 9"},"picture":{"large":"https://randomuser.me/api/portraits/women/32.jpg","medium":"https://randomuser.me/api/portraits/med/women/32.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/32.jpg"},"nat":"MX"},{"gender":"male","name":{"title":"Mr","first":"Christian","last":"Rose"},"location":{"street":{"number":803,"name":"Park Road"},"city":"Leeds","state":"Herefordshire","country":"United Kingdom","postcode":"NB9Q 1PU","coordinates":{"latitude":"59.6233","longitude":"-175.7912"},"timezone":{"offset":"+4:30","description":"Kabul"}},"email":"christian.rose@example.com","login":{"uuid":"5b4fc959-2ca0-466d-a701-52d8a128817a","username":"orangeostrich873","password":"bonjovi","salt":"p2ZzRQNe","md5":"3caf0c9acb40b8378935c8b420bffc63","sha1":"bdf2f28419b12089fe1500f475f4110b85292644","sha256":"16f820600d4a33faa75644c099e25cdf5885bb5ea62a9ce5eca18dbef6bba07c"},"dob":{"date":"1948-07-10T15:34:25.924Z","age":74},"registered":{"date":"2020-05-11T14:38:26.221Z","age":2},"phone":"017683 21089","cell":"07526 328653","id":{"name":"NINO","value":"PJ 67 70 30 E"},"picture":{"large":"https://randomuser.me/api/portraits/men/32.jpg","medium":"https://randomuser.me/api/portraits/med/men/32.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/32.jpg"},"nat":"GB"},{"gender":"male","name":{"title":"Mr","first":"Nicholas","last":"Parker"},"location":{"street":{"number":8067,"name":"Manor Road"},"city":"Preston","state":"Herefordshire","country":"United Kingdom","postcode":"CE2 7FA","coordinates":{"latitude":"6.7878","longitude":"-74.4922"},"timezone":{"offset":"-10:00","description":"Hawaii"}},"email":"nicholas.parker@example.com","login":{"uuid":"06e74bb3-a6e2-4d25-8aba-99c1b0df6dc5","username":"brownpeacock385","password":"grant","salt":"vBBsJZGB","md5":"e31a6010a036bb58342e1632e2c61b72","sha1":"52c221ab3e86c446adc880e03b46d3038287ea35","sha256":"9b7a9585f2fbb8ce7546dabb2ab60a2baeb10f96661c4b32e561b71196a235b7"},"dob":{"date":"1968-11-04T01:54:14.310Z","age":54},"registered":{"date":"2015-09-28T11:37:37.573Z","age":7},"phone":"025 0967 2007","cell":"07993 408613","id":{"name":"NINO","value":"NS 82 61 17 N"},"picture":{"large":"https://randomuser.me/api/portraits/men/27.jpg","medium":"https://randomuser.me/api/portraits/med/men/27.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/27.jpg"},"nat":"GB"},{"gender":"female","name":{"title":"Miss","first":"Charisse","last":"Van den Brand"},"location":{"street":{"number":8446,"name":"Bankade"},"city":"Lenthe","state":"Noord-Holland","country":"Netherlands","postcode":"8509 CU","coordinates":{"latitude":"-74.6703","longitude":"-109.6184"},"timezone":{"offset":"-12:00","description":"Eniwetok, Kwajalein"}},"email":"charisse.vandenbrand@example.com","login":{"uuid":"5226f48e-ab5c-4f03-9641-6b1be8051c0d","username":"blackgorilla351","password":"legos","salt":"X2juGphp","md5":"3a9a478538d3f12cd383f1ca5076a18f","sha1":"2bc3ee8e3cbd2f232d3d65e56360fa373e14a8b9","sha256":"e0e2e8579d1965bd9e0d13757a8e500f80f677c01d32e2c11f96d50f8814a3bd"},"dob":{"date":"1990-09-06T18:19:56.620Z","age":32},"registered":{"date":"2019-02-08T06:50:53.368Z","age":4},"phone":"(0874) 001700","cell":"(06) 11022907","id":{"name":"BSN","value":"69811235"},"picture":{"large":"https://randomuser.me/api/portraits/women/88.jpg","medium":"https://randomuser.me/api/portraits/med/women/88.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/88.jpg"},"nat":"NL"}],"info":{"seed":"eec93eb4461ce2c7","results":10,"page":1,"version":"1.4"}});
});

module.exports = app;
