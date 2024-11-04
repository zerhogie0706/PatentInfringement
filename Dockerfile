FROM python:3.10

ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    netcat-openbsd

# Install Node.js and npm
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

# Copy requirements.txt and install dependencies separately
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Build React frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app
RUN python manage.py collectstatic --noinput

EXPOSE 8000