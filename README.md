# VisionMD Electron
This repo holds the source code for the frontend of VisionMD Electron. Below is the documentation for developing, building and deploying the VisionMD Desktop app.


## Development
Follow the below steps to get the app running for development.

### 1. Install Libraries
Run `npm install`. This will install all the required node modules from the package.json file.

### 2. Run the backend server
The backend server is a Django server that can be found at https://github.com/mea-lab/VisionMD-Gait-BackEnd. Follow the instructions from the above repository and run it for development and testing. You must have the backend Django server running on `127.0.0.1` in order to run the full app.

### 3. Run the frontend server

Run `npm run dev`. This starts the app by default on the port 5173. It will automatically open up a window for you to view and test.


## Building
Below details the steps for building the installers and packages needed for Linux, MacOS, and Windows. This assumes you already have correctly built and copied over the pyinstaller executable for your OS. If not, follow the instructions for building this at https://github.com/mea-lab/VisionMD-Gait-BackEnd.

### Windows
