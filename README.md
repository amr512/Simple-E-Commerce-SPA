# Simple Ecommerce Website
## How to run
### backend-server
Use npm, pnpm, yarn, or your favorite flavor of the node package manager to install dependencies then run the `start` command. 

The backend server is expected to be on port 5500, while the frontend is expected to be on port 3000. Other ports are most likely expected to break things.
### web 
***If*** the included `/.vscode/config.json` file doesn't take care of setting the live server up correctly, **make sure you set the root of the live server to the `/web/` folder, otherwise file paths *WILL* break.** \
Either start vscode in the `/web/` folder, or set the live server root to `/web/` in the live server settings. Make sure you also set the live server port to 3000.`