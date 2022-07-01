const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const express = require('express');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const fs = require("fs");
const {ApolloServer, gql} = require("apollo-server-express");

const port = 9000;
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

const app = express();
app.use(cors(), bodyParser.json(), expressJwt({
                                                  secret: jwtSecret,
                                                  credentialsRequired: false
                                              }));

const typeDefs = gql(fs.readFileSync('./schema.graphql', 'utf-8'));
const resolvers = require('./resolvers');

let apolloServer = null;
const startServer = async () => {
    apolloServer = new ApolloServer(
        {
            typeDefs, resolvers,
            context: ({req}) => {
                // if there's a token, jwt lib will decode it and return the user to the context
                // automatically.

                // const token = req.headers.authorization || '';
                // const user = jwt.verify(token, jwtSecret);
                return {user: req.user};
            }
        });
    await apolloServer.start();
    apolloServer.applyMiddleware({app, path: '/graphql'});
}
startServer()

app.post('/login', (req, res) => {
    const {email, password} = req.body;
    const user = db.users.list().find((user) => user.email === email);
    if (!(user && user.password === password)) {
        res.sendStatus(401);
        return;
    }
    const token = jwt.sign({sub: user.id}, jwtSecret);
    res.send({token});
});

app.listen(port, () => {
    console.info(`Server started on port ${port}`)
    console.info(`GraphQL server running at http://localhost:${port}${apolloServer?.graphqlPath}`)
});
