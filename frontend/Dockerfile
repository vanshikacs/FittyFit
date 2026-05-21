FROM node:20-alpine

WORKDIR /app

# Install yarn deps first (cache layer)
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install

# Copy source
COPY . .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["yarn", "start"]
