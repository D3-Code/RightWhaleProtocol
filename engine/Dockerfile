# Use Node.js LTS (Long Term Support)
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (only production)
RUN npm install

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Start the bot
CMD [ "npm", "start" ]
