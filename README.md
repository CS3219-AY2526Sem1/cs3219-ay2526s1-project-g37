# CS3219 Project (PeerPrep) - AY2526S1
## Group: G37

### Note: 
- You are required to develop individual microservices within separate folders within this repository.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements. 

<hr/>

## How to run full service:

1. Create root `.env` and add required parameters (can copy paste from telegram chat) 
2. Prod Run with `docker-compose -f docker-compose.yml up --profile prod`
3. Dev Run with `docker-compose -f docker-compose.yml up --profile dev`
4. To rebuild, add `--build` flag to above command
5. To change between prod and dev stop the current running containers with `docker-compose -f docker-compose.yml down` and re-run the above command with the desired profile.

<hr />

### for user-service
- go to firebase project settings > service account > generate new private key.
- rename the downloaded json file into serviceAccountKey.json and paste it the same dir as .env.

---

### To Test Question Service
1. Create a copy of `./services/question-service/.env.example` and name it `.env`
1. Populate the file with the **DEV** credentials for question service
1. Ensure you have docker desktop installed
1. Run this command in the root directory of this repo:
    ```bash
    docker-compose -f ./services/question-service/docker-compose.yml up
    ```
    This does the following
    1. Start the local postgres DB
    2. Start the question service FastAPI server
    3. Runs a script that inserts one question in the form of a HTML documen. And two images (Note that the images are inserted into the dev S3 bucket and referenced using a cloundfront URL)
2. View the Swagger docs at http://localhost:8000/docs
3. Make API calls to the service either through the Swagger UI or using your own methods

---


### To test alpha version collab service:
1. Run this command on root:
```bash
docker-compose -f docker-compose.collab.yml up
```
It should start up the 4 services required

2. Go on browser (I used firefox) and open two tabs:
- `localhost:5173` - acts as User 1
- `localhost:5174` - act as User 2 (Collaborator)

Note: if you encounter an error similar to:
```bash
Oops!

can't access property "useRef", resolveDispatcher() is null

node_modules/react/cjs/react.development.js/exports.useRef@http://localhost:5173/node_modules/.vite/deps/chunk-2WHLTL63.js?v=c5ccc1d9:949:16
useProviderColorScheme@http://localhost:5173/node_modules/.vite/deps/@mantine_core.js?v=0d551787:3925:43
...
```
Try waiting ~30 seconds to a minute before refreshing, sometimes vite needs time to optimize the dependencies

3. Click on the `Go to Collab` button for both

Now that you are in Collab page for both users, two things are testable:
- Code editor should be fully synchronized between the two users
- End Session will (send a `console.log("Redirecting to next page...")`) to both user's FE consoles. this can later be further expanded to redirect users to next pages




