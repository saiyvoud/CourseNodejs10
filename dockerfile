# Use an official Node.js image as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the required npm packages
RUN npm install

# Copy the rest of the application files to the container
COPY . .


EXPOSE 3000
# Specify the command to run when the container starts
CMD ["npm", "start"]