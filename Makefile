# Makefile para facilitar builds e deploy local/container

.PHONY: build docker-build docker-up docker-down docker-logs test

build:
	npm install

docker-build:
	docker build -t simgec-backend .

docker-up:
	docker compose up --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

test:
	npm test
